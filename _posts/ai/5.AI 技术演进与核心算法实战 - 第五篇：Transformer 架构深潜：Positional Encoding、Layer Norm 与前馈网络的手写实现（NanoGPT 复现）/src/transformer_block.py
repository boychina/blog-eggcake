import torch
import torch.nn as nn
import torch.nn.functional as F
import math

# ---------------------------------------------------------
# 1. 简化的多头自注意力机制 (CausalSelfAttention)
# 为了让代码跑起来，我们补充一个上一篇中提到的注意力模块
# ---------------------------------------------------------
class CausalSelfAttention(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        assert n_embd % n_head == 0
        self.c_attn = nn.Linear(n_embd, 3 * n_embd)
        self.c_proj = nn.Linear(n_embd, n_embd)
        self.n_head = n_head
        self.n_embd = n_embd
        self.register_buffer("bias", torch.tril(torch.ones(1024, 1024))
                                     .view(1, 1, 1024, 1024))

    def forward(self, x):
        B, T, C = x.size() # batch size, sequence length, embedding dimensionality (n_embd)
        # calculate query, key, values for all heads in batch and move head forward to be the batch dim
        qkv = self.c_attn(x)
        q, k, v = qkv.split(self.n_embd, dim=2)
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)

        # causal self-attention; Self-attend: (B, nh, T, hs) x (B, nh, hs, T) -> (B, nh, T, T)
        att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(k.size(-1)))
        att = att.masked_fill(self.bias[:,:,:T,:T] == 0, float('-inf'))
        att = F.softmax(att, dim=-1)
        y = att @ v # (B, nh, T, T) x (B, nh, T, hs) -> (B, nh, T, hs)
        y = y.transpose(1, 2).contiguous().view(B, T, C) # re-assemble all head outputs side by side
        return self.c_proj(y)

# ---------------------------------------------------------
# 2. 位置编码 (PositionalEncoding)
# ---------------------------------------------------------
class PositionalEncoding(nn.Module):
    def __init__(self, block_size, n_embd):
        super().__init__()
        # block_size 是最大序列长度，n_embd 是词向量维度
        # 直接创建一个可学习的 Embedding 矩阵 (block_size, n_embd)
        self.pos_emb = nn.Embedding(block_size, n_embd)
        
    def forward(self, x):
        # x 的 shape: (batch_size, seq_len, n_embd)
        B, T, C = x.shape
        # 生成 0 到 T-1 的位置索引
        pos = torch.arange(0, T, dtype=torch.long, device=x.device) # (T)
        # 获取位置向量并与输入相加
        pos_emb = self.pos_emb(pos) # (T, C)
        return x + pos_emb # 利用广播机制 (B, T, C) + (T, C) -> (B, T, C)

# ---------------------------------------------------------
# 3. 层归一化 (LayerNorm)
# ---------------------------------------------------------
class LayerNorm(nn.Module):
    def __init__(self, ndim, bias=True):
        super().__init__()
        # 可学习的缩放参数 gamma 和平移参数 beta
        self.weight = nn.Parameter(torch.ones(ndim))
        self.bias = nn.Parameter(torch.zeros(ndim)) if bias else None

    def forward(self, input):
        # input shape: (Batch, SeqLen, EmbeddingDim)
        # 在 Embedding 维度（最后一步）上计算均值和方差
        mean = input.mean(dim=-1, keepdim=True)
        var = input.var(dim=-1, keepdim=True, unbiased=False)
        
        # 归一化：减均值，除以标准差 (加 1e-5 防止除零)
        out = (input - mean) / torch.sqrt(var + 1e-5)
        
        # 应用可学习的仿射变换
        out = out * self.weight
        if self.bias is not None:
            out = out + self.bias
        return out

# ---------------------------------------------------------
# 4. 前馈网络 (FeedForward)
# ---------------------------------------------------------
class FeedForward(nn.Module):
    def __init__(self, n_embd):
        super().__init__()
        self.net = nn.Sequential(
            # 1. 升维：放大 4 倍
            nn.Linear(n_embd, 4 * n_embd),
            # 2. 非线性激活：GPT 系列通常使用 GELU
            nn.GELU(),
            # 3. 降维：还原回 n_embd
            nn.Linear(4 * n_embd, n_embd),
            # Dropout 防止过拟合
            nn.Dropout(0.1),
        )

    def forward(self, x):
        return self.net(x)

# ---------------------------------------------------------
# 5. 完整的 Transformer Block
# ---------------------------------------------------------
class Block(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        # 1. 归一化层 1
        self.ln_1 = LayerNorm(n_embd)
        # 2. 多头自注意力机制
        self.attn = CausalSelfAttention(n_embd, n_head)
        # 3. 归一化层 2
        self.ln_2 = LayerNorm(n_embd)
        # 4. 前馈网络
        self.mlp = FeedForward(n_embd)

    def forward(self, x):
        # 注意这里的结构是 Pre-LN：先做 LayerNorm，再输入到模块，最后加上残差
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x

# ---------------------------------------------------------
# 6. 测试运行代码
# ---------------------------------------------------------
if __name__ == "__main__":
    # 超参数设置
    batch_size = 2
    seq_len = 8       # 句子长度
    n_embd = 32       # 词向量维度
    n_head = 4        # 注意力头数
    block_size = 128  # 最大序列长度 (供位置编码使用)

    print(f"正在初始化配置: Batch={batch_size}, SeqLen={seq_len}, EmbedDim={n_embd}, Heads={n_head}")
    
    # 模拟一个输入的词向量矩阵 (尚未添加位置信息)
    # 在真实场景中，这通常是 nn.Embedding(vocab_size, n_embd) 的输出
    x = torch.randn(batch_size, seq_len, n_embd)
    print(f"\n[1] 原始输入特征 x 的形状: {x.shape}")

    # 1. 添加位置编码
    pos_encoder = PositionalEncoding(block_size, n_embd)
    x = pos_encoder(x)
    print(f"[2] 经过位置编码后的特征形状: {x.shape} (未改变维度，数值被注入了时序特征)")

    # 2. 经过一个 Transformer Block
    transformer_block = Block(n_embd, n_head)
    out = transformer_block(x)
    print(f"[3] 经过一个完整的 Transformer Block (Pre-LN) 后的输出形状: {out.shape}")
    
    print("\n✅ 运行成功！模型的所有组件能够完美衔接工作。")
