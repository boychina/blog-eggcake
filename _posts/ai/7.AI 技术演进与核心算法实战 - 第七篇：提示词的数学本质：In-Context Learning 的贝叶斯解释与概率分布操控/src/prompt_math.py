"""
提示词的数学本质实战代码
包含：概率分布可视化、提示词对分布的影响、In-Context Learning 模拟
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import json


# ============ 1. Softmax 概率分布引擎 ============

def softmax_with_temperature(logits, temperature=1.0):
    """
    带温度的 Softmax 函数
    
    参数:
        logits: 原始分数向量 (vocab_size,)
        temperature: 温度参数，控制分布的"尖锐"程度
    
    物理意义:
        - temperature → 0: 分布变成 one-hot（只选最高分）
        - temperature = 1: 标准概率分布
        - temperature → ∞: 分布变成均匀分布（每个词等概率）
    """
    logits = logits / temperature
    exp_logits = torch.exp(logits - torch.max(logits))  # 数值稳定
    return exp_logits / exp_logits.sum()


def visualize_distribution(tokens, probs, title="概率分布"):
    """
    将概率分布以文本柱状图的方式可视化
    
    比喻：就像一个"概率转盘"，每个扇区的大小代表对应词的概率
    """
    max_prob = max(probs)
    bar_width = 40  # 最长柱子的宽度
    
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    for token, prob in zip(tokens, probs):
        bar_len = int(bar_width * prob / max_prob) if max_prob > 0 else 0
        bar = '█' * bar_len
        print(f"  {token:>10s} │{bar:<{bar_width}}│ {prob*100:6.2f}%")
    print(f"{'='*60}\n")


# ============ 2. 模拟 LLM 的条件概率生成 ============

class SimpleGPT(nn.Module):
    """
    极简 GPT 模型 —— 用于演示提示词如何影响概率分布
    
    这个模型不是真正的 GPT，而是一个简化版，
    用来展示：不同的 prompt 如何改变输出的概率分布
    """
    def __init__(self, vocab_size, n_embd=64, n_head=4, n_layer=2, block_size=64):
        super().__init__()
        self.block_size = block_size
        
        # 词嵌入和位置嵌入
        self.token_embedding = nn.Embedding(vocab_size, n_embd)
        self.position_embedding = nn.Embedding(block_size, n_embd)
        
        # 简单的 Transformer 层
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=n_embd, 
                nhead=n_head, 
                dim_feedforward=n_embd * 4,
                dropout=0.1,
                batch_first=True
            ) for _ in range(n_layer)
        ])
        
        # 层归一化
        self.ln_f = nn.LayerNorm(n_embd)
        
        # LM 头
        self.lm_head = nn.Linear(n_embd, vocab_size, bias=False)
        
        # 初始化
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, idx):
        """
        idx: (batch, seq_len) token IDs
        返回: (batch, seq_len, vocab_size) logits
        """
        B, T = idx.size()
        assert T <= self.block_size, f"序列长度超出限制: {T} > {self.block_size}"
        
        # 获取嵌入
        tok_emb = self.token_embedding(idx)
        pos_emb = self.position_embedding(torch.arange(T, device=idx.device))
        x = tok_emb + pos_emb
        
        # 通过 Transformer 层
        for layer in self.layers:
            x = layer(x)
        x = self.ln_f(x)
        
        # 计算 logits
        logits = self.lm_head(x)
        return logits
    
    @torch.no_grad()
    def generate(self, idx, max_new_tokens=20, temperature=1.0):
        """
        自回归生成
        """
        for _ in range(max_new_tokens):
            # 截断到 block_size
            idx_cond = idx if idx.size(1) <= self.block_size else idx[:, -self.block_size:]
            logits = self(idx_cond)
            # 只取最后一个位置的 logits
            logits = logits[:, -1, :] / temperature
            # 采样
            probs = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
            idx = torch.cat([idx, idx_next], dim=1)
        return idx


# ============ 3. In-Context Learning 模拟 ============

def simulate_icl_effect():
    """
    模拟 In-Context Learning 效果
    
    用一个简单的思想实验来展示：
    Few-shot 示例如何改变模型的输出概率分布
    
    类比：
    - 无示例 = 你看到一个空白的翻译任务，不知道该用什么风格
    - 有示例 = 你看到了参考翻译，知道该用什么风格和格式
    """
    print("\n" + "=" * 70)
    print("  In-Context Learning 效果模拟")
    print("=" * 70)
    
    # 模拟一个简单的"翻译任务"
    # 模型对下一个 token 的原始概率分布（模拟的）
    vocabulary = ["北京", "上海", "东京", "London", "Paris", "纽约", "柏林"]
    
    print("\n📝 任务：将 'capital of China' 翻译成目标语言")
    print()
    
    # 场景 1：Zero-shot（无示例）
    print("📌 场景 1: Zero-shot（无示例）")
    print("   提示词: 'capital of China ->'")
    probs_zeroshot = [0.25, 0.15, 0.10, 0.15, 0.10, 0.05, 0.20]
    visualize_distribution(vocabulary, probs_zeroshot, "Zero-shot 概率分布")
    
    # 场景 2：Few-shot（提供格式示例）
    print("📌 场景 2: Few-shot（提供中文示例）")
    print("   提示词: 'capital of Japan -> 东京")
    print("           capital of France -> 巴黎")
    print("           capital of China ->'")
    probs_fewshot_cn = [0.55, 0.08, 0.02, 0.05, 0.03, 0.07, 0.20]
    visualize_distribution(vocabulary, probs_fewshot_cn, "Few-shot（中文示例）概率分布")
    
    # 场景 3：Few-shot（提供英文示例）
    print("📌 场景 3: Few-shot（提供英文示例）")
    print("   提示词: 'capital of Japan -> Tokyo")
    print("           capital of France -> Paris")
    print("           capital of China ->'")
    probs_fewshot_en = [0.03, 0.02, 0.08, 0.50, 0.20, 0.07, 0.10]
    visualize_distribution(vocabulary, probs_fewshot_en, "Few-shot（英文示例）概率分布")
    
    # 分析
    print("📊 分析:")
    print("   • Zero-shot: 模型不确定该用什么语言，分布比较分散")
    print("   • Few-shot（中文）: 示例'激活'了中文输出模式，'北京'概率大幅提升")
    print("   • Few-shot（英文）: 示例'激活'了英文输出模式，'London'概率大幅提升")
    print()
    print("   💡 这就是 In-Context Learning 的本质：")
    print("   提供的示例改变了模型内部的概率分布，使其更可能输出期望的结果。")
    print()


# ============ 4. 贝叶斯推断可视化 ============

def bayesian_update_demo():
    """
    贝叶斯推断可视化
    
    贝叶斯公式: P(概念|上下文) ∝ P(上下文|概念) × P(概念)
    
    通俗解释:
    - 先验 P(概念): 模型在预训练中积累的知识（"常识"）
    - 似然 P(上下文|概念): 给定概念，看到这个上下文的概率
    - 后验 P(概念|上下文): 看到上下文后，对概念的更新认知
    
    比喻：医生看病
    - 先验 = 医生的基础知识（某种病的发病率）
    - 似然 = 检查结果（某种检查在患病/健康时的表现）
    - 后验 = 结合基础知识和检查结果的最终判断
    """
    print("\n" + "=" * 70)
    print("  贝叶斯推断可视化：提示词如何更新模型的'认知'")
    print("=" * 70)
    
    # 假设模型需要判断：用户想要什么？
    concepts = ["写代码", "写文章", "翻译", "写诗"]
    
    # 先验（预训练中学到的"默认"概率）
    prior = [0.30, 0.25, 0.25, 0.20]
    
    print("\n🔬 模拟场景：用户输入不同的提示词")
    print()
    
    # 场景 1: 模糊提示
    print("📌 场景 1: 模糊提示 '帮我做一件事'")
    likelihood_1 = [0.25, 0.25, 0.25, 0.25]  # 没有额外信息
    posterior_1 = [p * l for p, l in zip(prior, likelihood_1)]
    total = sum(posterior_1)
    posterior_1 = [p / total for p in posterior_1]
    
    print("   先验分布（预训练知识）:")
    visualize_distribution(concepts, prior, "先验: P(概念)")
    print("   似然（提示词提供的信息）:")
    visualize_distribution(concepts, likelihood_1, "似然: P(提示词|概念)")
    print("   后验分布（模型更新后的认知）:")
    visualize_distribution(concepts, posterior_1, "后验: P(概念|提示词)")
    
    # 场景 2: 明确的编程提示
    print("📌 场景 2: 明确提示 '用 Python 写一个快速排序算法'")
    likelihood_2 = [0.85, 0.05, 0.05, 0.05]
    posterior_2 = [p * l for p, l in zip(prior, likelihood_2)]
    total = sum(posterior_2)
    posterior_2 = [p / total for p in posterior_2]
    
    print("   先验分布（预训练知识）:")
    visualize_distribution(concepts, prior, "先验: P(概念)")
    print("   似然（提示词提供的信息）:")
    visualize_distribution(concepts, likelihood_2, "似然: P(提示词|概念)")
    print("   后验分布（模型更新后的认知）:")
    visualize_distribution(concepts, posterior_2, "后验: P(概念|提示词)")
    
    print("📊 分析:")
    print("   • 场景 1: 模糊提示没有提供有效信息，后验 ≈ 先验")
    print("   • 场景 2: 明确提示提供了强信号，'写代码'的后验概率从 30% 跃升到 {:.0f}%".format(posterior_2[0]*100))
    print("   • 这正是贝叶斯更新的精髓：新信息（提示词）更新旧认知（先验）")
    print()


# ============ 5. 概率分布操控策略 ============

def prompt_strategy_demo():
    """
    不同的提示词策略对概率分布的影响
    
    展示几种常见的提示工程策略：
    1. 系统角色设定
    2. 格式约束
    3. 思维链引导
    """
    print("\n" + "=" * 70)
    print("  提示词策略对概率分布的影响")
    print("=" * 70)
    
    # 任务：让模型回答"地球到月球的距离是多少？"
    answer_types = ["精确数值", "大致范围", "比喻描述", "科普讲解", "拒绝回答"]
    
    print("\n📝 任务: '地球到月球的距离是多少？'")
    print()
    
    # 策略 1: 直接提问
    print("📌 策略 1: 直接提问")
    print("   提示词: '地球到月球的距离是多少？'")
    probs_direct = [0.35, 0.30, 0.10, 0.20, 0.05]
    visualize_distribution(answer_types, probs_direct, "直接提问")
    
    # 策略 2: 专家角色
    print("📌 策略 2: 专家角色设定")
    print("   提示词: '你是一位天文学家。地球到月球的距离是多少？'")
    probs_expert = [0.15, 0.10, 0.05, 0.65, 0.05]
    visualize_distribution(answer_types, probs_expert, "专家角色")
    
    # 策略 3: 格式约束
    print("📌 策略 3: 格式约束")
    print("   提示词: '用 JSON 格式回答：{\"距离\": ..., \"单位\": ...}'")
    probs_format = [0.70, 0.05, 0.05, 0.05, 0.15]
    visualize_distribution(answer_types, probs_format, "格式约束")
    
    # 策略 4: 思维链
    print("📌 策略 4: 思维链 (Chain-of-Thought)")
    print("   提示词: '请一步步思考：1) 光速是多少？2) 光到月球需要多长时间？'")
    probs_cot = [0.05, 0.05, 0.05, 0.80, 0.05]
    visualize_distribution(answer_types, probs_cot, "思维链引导")
    
    print("📊 策略对比总结:")
    print("   ┌──────────────┬──────────┬──────────┬──────────┐")
    print("   │ 策略          │ 精确数值 │ 科普讲解 │ 拒绝回答 │")
    print("   ├──────────────┼──────────┼──────────┼──────────┤")
    print("   │ 直接提问      │  35%     │  20%     │   5%     │")
    print("   │ 专家角色      │  15%     │  65%     │   5%     │")
    print("   │ 格式约束      │  70%     │   5%     │  15%     │")
    print("   │ 思维链        │   5%     │  80%     │   5%     │")
    print("   └──────────────┴──────────┴──────────┴──────────┘")
    print()
    print("   💡 结论: 不同的提示词策略就像不同的'方向盘'，")
    print("   它们将概率分布推向不同的方向，从而控制模型的输出风格和内容。")
    print()


# ============ 6. Temperature 对分布的影响 ============

def temperature_effect_demo():
    """
    Temperature 参数对概率分布的影响
    
    这是下一篇文章会详细讲的内容，这里先做预告
    """
    print("\n" + "=" * 70)
    print("  Temperature 对概率分布的影响（预告）")
    print("=" * 70)
    
    tokens = ["猫", "狗", "兔", "鱼", "鸟"]
    # 模拟的 logits（原始分数）
    logits = torch.tensor([3.0, 2.0, 1.0, 0.5, 0.1])
    
    temperatures = [0.1, 0.5, 1.0, 2.0, 5.0]
    
    for temp in temperatures:
        probs = softmax_with_temperature(logits, temperature=temp)
        probs_list = probs.tolist()
        visualize_distribution(tokens, probs_list, f"Temperature = {temp}")
    
    print("📊 Temperature 效果总结:")
    print("   • T → 0: 分布极度集中（几乎确定性地选择最高分词）")
    print("   • T = 1: 标准分布（训练时的默认设置）")
    print("   • T → ∞: 分布趋近均匀（每个词概率差不多）")
    print()
    print("   💡 比喻: Temperature 就像'创意旋钮'")
    print("   - 旋钮关到最小(T→0): 最保守，总选最确定的答案")
    print("   - 旋钮开到最大(T→∞): 最有创意，什么答案都可能选")
    print()


# ============ 7. 完整测试 ============

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("  提示词的数学本质 — 核心代码演示")
    print("  In-Context Learning 的贝叶斯解释与概率分布操控")
    print("=" * 70)
    
    # 1. In-Context Learning 效果模拟
    simulate_icl_effect()
    
    # 2. 贝叶斯推断可视化
    bayesian_update_demo()
    
    # 3. 提示词策略对比
    prompt_strategy_demo()
    
    # 4. Temperature 效果预告
    temperature_effect_demo()
    
    print("✅ 所有演示完成！")
    print()
    print("📚 延伸思考:")
    print("   1. 为什么增加示例数量（few-shot）通常会提升效果？")
    print("      → 更多示例 = 更强的似然信号 = 更集中的后验分布")
    print("   2. 示例的顺序会影响结果吗？")
    print("      → 会！这被称为 'Recency Bias'（近因偏差）")
    print("   3. 什么样的示例最有效？")
    print("      → 与目标任务越相似、分布越均匀的示例越有效")
