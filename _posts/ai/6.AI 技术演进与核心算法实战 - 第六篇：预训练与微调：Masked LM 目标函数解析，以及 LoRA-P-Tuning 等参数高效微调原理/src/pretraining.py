"""
预训练与微调实战代码
包含：Masked LM 目标函数实现、LoRA 原理实现
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math


# ============ 1. Masked LM (MLM) 目标函数 ============

class MaskedLMHead(nn.Module):
    """
    Masked Language Model 头
    输入：Transformer 输出的隐藏状态
    输出：词汇表中每个词的概率分布
    """
    def __init__(self, n_embd, vocab_size):
        super().__init__()
        # 线性变换 + 归一化（可选择是否使用）
        self.linear = nn.Linear(n_embd, vocab_size)
        # 可选的 Layer Norm（BERT 使用的是不带 LN 的）
        # self.ln = nn.LayerNorm(n_embd)

    def forward(self, hidden_states, labels=None):
        """
        hidden_states: (batch_size, seq_len, n_embd)
        返回： logits (batch_size, seq_len, vocab_size)
        """
        # 计算 logits
        logits = self.linear(hidden_states)
        
        if labels is not None:
            # 计算交叉熵损失
            loss_fn = nn.CrossEntropyLoss(ignore_index=-100)  # -100 表示忽略的位置
            # 将 batch 维度合并： (batch*seq, vocab)
            loss = loss_fn(logits.view(-1, logits.size(-1)), labels.view(-1))
            return logits, loss
        
        return logits


def apply_mlm_mask(tokens, mask_ratio=0.15, tokenizer=None):
    """
    对输入序列应用 MLM 遮盖
    
    参数:
        tokens: 输入 token IDs (batch_size, seq_len)
        mask_ratio: 遮盖比例，默认 15%
    
    返回:
        masked_tokens: 遮盖后的 tokens
        labels: 原始 tokens（用于计算损失）
        mask_positions: 遮盖位置的掩码
    """
    batch_size, seq_len = tokens.shape
    labels = tokens.clone()
    
    # 创建遮盖掩码
    probability_matrix = torch.full(tokens.shape, mask_ratio)
    # 不对特殊 token（padding、cls、sep）进行遮盖
    # 假设 tokenizer 的 pad_token_id = 0, 特殊 token < vocab_size 的前几个
    
    masked_indices = torch.bernoulli(probability_matrix).bool()
    labels[~masked_indices] = -100  # 非遮盖位置不计算损失
    
    # 80% 替换为 [MASK], 10% 替换为随机词, 10% 保持不变
    rand = torch.rand(masked_indices.shape)
    masked_tokens = tokens.clone()
    
    # 80% -> [MASK]
    mask_mask = masked_indices & (rand < 0.8)
    masked_tokens[mask_mask] = tokenizer.mask_token_id if tokenizer else 4  # 4 是 BERT 的 [MASK]
    
    # 10% -> 随机词
    random_mask = masked_indices & (rand >= 0.8) & (rand < 0.9)
    random_words = torch.randint_like(masked_tokens, 0, 30000)
    masked_tokens[random_mask] = random_words[random_mask]
    
    # 10% 保持不变（但仍然计算损失）
    
    return masked_tokens, labels, masked_indices


# ============ 2. Causal LM (CLM) 目标函数 ============

class CausalLMHead(nn.Module):
    """
    Causal Language Model 头（用于 GPT 风格模型）
    """
    def __init__(self, n_embd, vocab_size):
        super().__init__()
        self.linear = nn.Linear(n_embd, vocab_size, bias=False)

    def forward(self, hidden_states, labels=None):
        """
        hidden_states: (batch_size, seq_len, n_embd)
        labels: (batch_size, seq_len) 目标 token IDs
        """
        # 移动权重共享（可选）
        # logits = F.linear(hidden_states, self.embedding.weight)
        logits = self.linear(hidden_states)
        
        if labels is not None:
            # 移位：预测第 i+1 个词时，使用第 i 个词的表示
            # 损失只计算最后一个 token 开始的预测
            shift_logits = logits[..., :-1, :].contiguous()
            shift_labels = labels[..., 1:].contiguous()
            
            loss_fn = nn.CrossEntropyLoss(ignore_index=-100)
            loss = loss_fn(shift_logits.view(-1, shift_logits.size(-1)), shift_labels.view(-1))
            return logits, loss
        
        return logits


# ============ 3. LoRA 实现 ============

class LoRALayer(nn.Module):
    """
    LoRA (Low-Rank Adaptation) 层
    
    核心思想：将预训练权重 W 保持冻结，
    额外学习两个小矩阵 A 和 B，
    输出 = Wx + BAx
    """
    def __init__(self, original_layer, rank=8, alpha=16):
        super().__init__()
        self.original_layer = original_layer
        self.rank = rank
        self.alpha = alpha
        
        # 原始权重维度
        in_features = original_layer.in_features
        out_features = original_layer.out_features
        
        # LoRA 的两个小矩阵
        # A: (in_features, rank) - 下投影
        # B: (rank, out_features) - 上投影
        self.lora_A = nn.Parameter(torch.zeros(in_features, rank))
        self.lora_B = nn.Parameter(torch.zeros(rank, out_features))
        
        # 缩放因子
        self.scaling = alpha / rank
        
        # 初始化 A 为随机高斯分布，B 为零
        nn.init.normal_(self.lora_A, mean=0, std=0.02)
        nn.init.zeros_(self.lora_B)
        
        # 冻结原始权重
        for param in self.original_layer.parameters():
            param.requires_grad = False

    def forward(self, x):
        """
        x: (batch_size, seq_len, in_features)
        """
        # 原始输出
        original_output = self.original_layer(x)
        
        # LoRA 输出
        # x @ A @ B
        lora_output = torch.matmul(x, self.lora_A)
        lora_output = torch.matmul(lora_output, self.lora_B)
        lora_output = lora_output * self.scaling
        
        return original_output + lora_output
    
    def merge_weights(self):
        """
        将 LoRA 权重合并回原始层
        合并后可以像原始模型一样使用，但不再能分离训练
        """
        # W_new = W + (alpha/rank) * B @ A
        delta_weight = torch.matmul(self.lora_B, self.lora_A) * self.scaling
        self.original_layer.weight.data += delta_weight


class LoRALinear(nn.Module):
    """
    完整的 LoRA Linear 层（不依赖原始层）
    """
    def __init__(self, in_features, out_features, rank=8, alpha=16, bias=True):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        
        # 原始权重
        self.weight = nn.Parameter(torch.empty(out_features, in_features))
        self.bias = nn.Parameter(torch.empty(out_features)) if bias else None
        
        # LoRA 权重
        self.lora_A = nn.Parameter(torch.empty(in_features, rank))
        self.lora_B = nn.Parameter(torch.empty(rank, out_features))
        
        # 初始化
        nn.init.kaiming_uniform_(self.weight, a=math.sqrt(5))
        if self.bias is not None:
            nn.init.zeros_(self.bias)
        nn.init.normal_(self.lora_A, std=0.02)
        nn.init.zeros_(self.lora_B)
        
        # 冻结原始权重
        self.weight.requires_grad = False
        if self.bias is not None:
            self.bias.requires_grad = False

    def forward(self, x):
        # 原始输出
        original = F.linear(x, self.weight, self.bias)
        # LoRA 输出
        lora = (x @ self.lora_A @ self.lora_B) * self.scaling
        return original + lora
    
    def trainable_params(self):
        """返回可训练参数"""
        return [self.lora_A, self.lora_B]


# ============ 4. P-Tuning 实现 ============

class PromptEmbedding(nn.Module):
    """
    P-Tuning: 可学习的 Prompt Embedding
    
    与固定的前缀不同，P-Tuning 允许模型学习最优的 prompt 表示
    """
    def __init__(self, num_prompt_tokens, n_embd, init_strategy='uniform'):
        super().__init__()
        self.num_prompt_tokens = num_prompt_tokens
        
        # 可学习的 prompt embedding
        self.prompt_embeddings = nn.Parameter(
            torch.empty(num_prompt_tokens, n_embd)
        )
        
        # 初始化策略
        if init_strategy == 'uniform':
            nn.init.uniform_(self.prompt_embeddings, -0.1, 0.1)
        elif init_strategy == 'vocab':
            # 从词汇表中采样初始化
            nn.init.normal_(self.prompt_embeddings, std=0.07)
    
    def forward(self, batch_size):
        """
        生成批量 prompt embedding
        """
        # (num_prompt_tokens, n_embd) -> (batch_size, num_prompt_tokens, n_embd)
        return self.prompt_embeddings.unsqueeze(0).expand(batch_size, -1, -1)


class PTuning(nn.Module):
    """
    完整的 P-Tuning 模块
    """
    def __init__(self, num_prompt_tokens, n_embd, encoder_hidden_size=768):
        super().__init__()
        self.num_prompt_tokens = num_prompt_tokens
        
        # Prompt embedding
        self.prompt_embeddings = nn.Embedding(num_prompt_tokens, n_embd)
        
        # 可选的 MLP 编码器（将 prompt tokens 投影到更好的空间）
        self.prompt_encoder = nn.Sequential(
            nn.Linear(n_embd, encoder_hidden_size),
            nn.ReLU(),
            nn.Linear(encoder_hidden_size, n_embd)
        )
        
        # 初始化
        nn.init.uniform_(self.prompt_embeddings.weight, -0.1, 0.1)
    
    def forward(self, input_ids, embed_layer):
        """
        将可学习的 prompt 嵌入到输入中
        
        input_ids: (batch_size, seq_len)
        embed_layer: 词嵌入层
        """
        batch_size = input_ids.size(0)
        
        # 获取原始文本嵌入
        text_embeddings = embed_layer(input_ids)
        
        # 生成 prompt 嵌入
        prompt_token_ids = torch.arange(
            self.num_prompt_tokens, 
            device=input_ids.device
        )
        prompt_embeddings = self.prompt_embeddings(prompt_token_ids)
        
        # 通过 MLP 编码（可选）
        prompt_embeddings = self.prompt_encoder(prompt_embeddings)
        
        # 拼接 prompt 和原始文本
        # (batch_size, num_prompt + seq_len, n_embd)
        combined = torch.cat([prompt_embeddings.unsqueeze(0).expand(batch_size, -1, -1), 
                              text_embeddings], dim=1)
        
        return combined


# ============ 5. 测试代码 ============

def test_masked_lm():
    """测试 MLM"""
    print("=" * 50)
    print("测试 Masked LM")
    print("=" * 50)
    
    # 配置
    batch_size = 2
    seq_len = 8
    n_embd = 32
    vocab_size = 1000
    
    # 模拟输入
    tokens = torch.randint(0, vocab_size, (batch_size, seq_len))
    print(f"原始 tokens shape: {tokens.shape}")
    print(f"原始 tokens: {tokens}")
    
    # 模拟 Transformer 输出
    hidden_states = torch.randn(batch_size, seq_len, n_embd)
    
    # MLM 头
    mlm_head = MaskedLMHead(n_embd, vocab_size)
    logits, loss = mlm_head(hidden_states, labels=tokens)
    
    print(f"MLM logits shape: {logits.shape}")
    print(f"MLM loss: {loss.item():.4f}")
    print()


def test_lora():
    """测试 LoRA"""
    print("=" * 50)
    print("测试 LoRA")
    print("=" * 50)
    
    # 配置
    batch_size = 2
    seq_len = 8
    n_embd = 32
    rank = 4
    alpha = 8
    
    # 原始 Linear 层
    original_linear = nn.Linear(n_embd, n_embd)
    
    # LoRA 层包装
    lora_layer = LoRALayer(original_linear, rank=rank, alpha=alpha)
    
    # 测试输入
    x = torch.randn(batch_size, seq_len, n_embd)
    
    # 前向传播
    output = lora_layer(x)
    
    print(f"输入 shape: {x.shape}")
    print(f"输出 shape: {output.shape}")
    print(f"原始层参数是否冻结: {not original_linear.weight.requires_grad}")
    print(f"LoRA A 矩阵参数数量: {lora_layer.lora_A.numel()}")
    print(f"LoRA B 矩阵参数数量: {lora_layer.lora_B.numel()}")
    print(f"原始层参数数量: {original_linear.weight.numel()}")
    print(f"参数量节省: {(lora_layer.lora_A.numel() + lora_layer.lora_B.numel()) / original_linear.weight.numel() * 100:.2f}%")
    print()


def test_prompt_embedding():
    """测试 P-Tuning"""
    print("=" * 50)
    print("测试 P-Tuning")
    print("=" * 50)
    
    # 配置
    batch_size = 2
    num_prompt_tokens = 10
    n_embd = 32
    
    # Prompt Embedding
    prompt_embed = PromptEmbedding(num_prompt_tokens, n_embd)
    
    # 生成 prompt
    prompts = prompt_embed(batch_size)
    
    print(f"批次大小: {batch_size}")
    print(f"Prompt token 数量: {num_prompt_tokens}")
    print(f"Prompt embedding shape: {prompts.shape}")
    print(f"可学习参数数量: {sum(p.numel() for p in prompt_embed.parameters())}")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("预训练与微调 - 核心代码实现测试")
    print("=" * 60 + "\n")
    
    test_masked_lm()
    test_lora()
    test_prompt_embedding()
    
    print("✅ 所有测试通过！")
