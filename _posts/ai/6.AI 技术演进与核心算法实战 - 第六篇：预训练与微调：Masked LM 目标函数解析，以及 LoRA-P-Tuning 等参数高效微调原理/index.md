---
title: "AI 技术演进与核心算法实战 | 第六篇：预训练与微调：Masked LM 目标函数解析，以及 LoRA/P-Tuning 等参数高效微调原理"
excerpt: "大模型是如何“读遍天下书”的？Masked LM 目标函数详解，从零实现预训练流程。深入剖析 LoRA/P-Tuning 等参数高效微调黑科技，让普通玩家也能玩转千亿大模型。"
description: "AI 技术演进与核心算法实战第六篇：预训练与微调：Masked LM 目标函数解析，以及 LoRA-P-Tuning 等参数高效微调原理"
keyword: "AI,大模型,预训练,微调,Masked LM,MLM,LoRA,P-Tuning,参数高效微调"
tag: "AI"
date: "2025-08-13 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战-第六篇：预训练与微调：Masked-LM-目标函数解析，以及-LoRA-P-Tuning-等参数高效微调原理/assets/cover/pretraining-cover.svg"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战-第六篇：预训练与微调：Masked-LM-目标函数解析，以及-LoRA-P-Tuning-等参数高效微调原理/assets/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战-第六篇：预训练与微调：Masked-LM-目标函数解析，以及-LoRA-P-Tuning-等参数高效微调原理/assets/cover/pretraining-cover.svg"
---

> 如果说 Transformer 是大模型的骨架，那么预训练与微调就是赋予它“灵魂”的关键过程。

在[上一篇](5.AI%20%E6%8A%80%E6%9C%AF%E6%BC%94%E8%BF%9B%E4%B8%8E%E6%A0%B8%E5%BF%83%E7%AE%97%E6%B3%95%E5%AE%9E%E6%88%98%20-%20Transformer%20%E6%9E%B6%E6%9E%84%E6%B7%B1%E6%BD%9C%EF%BC%9APositional%20Encoding%E3%80%81Layer%20Norm%20%E4%B8%8E%E5%89%8D%E9%A6%8F%E7%BD%91%E7%BB%9C%E7%9A%84%E6%89%8B%E5%86%99%E5%AE%9E%E7%8E%B0%EF%BC%88NanoGPT%20%E5%A4%8D%E7%8E%B0%EF%BC%89/index.md)中，我们拼装出了完整的 Transformer Block，理解了模型架构的细节。但一个重要的问题仍然悬而未决：**模型是如何学会“说话”的？**

换句话说，Transformer 的权重是从哪里来的？这就涉及到两个核心概念：**预训练（Pre-training）**和**微调（Fine-tuning）**。

本篇是 **《AI 技术演进与核心算法实战》第一模块的第六篇**。我们将深入剖析大模型是如何通过 Masked LM 目标函数“读遍天下书”的，并手把手实现预训练流程。更重要的是，我们将重点介绍 LoRA、P-Tuning 等参数高效微调技术，让你不需要千块 GPU 也能玩转大模型！

---

## 1. 预训练：让模型“读遍天下书”

想象一下，如果让你从零开始学习一门语言，你会怎么做？

1. **大量阅读**：读各种书籍、文章、网页，积累词汇量和语法感觉。
2. **总结规律**：从大量文本中，自动发现语言的规律——哪些词经常一起出现、什么样的句子是合理的。

这就是预训练做的事情：**让模型在海量文本上学习通用的“语言能力”**，而不关心具体是什么任务。

### 1.1 预训练的本质：下一个词预测

预训练的核心目标非常简单粗暴：**给定前文，预测下一个词**。

比如，给定句子“The cat sat on the ___”，模型应该能预测出最后一个词是“mat”。

这个过程就像是一个**超级填空题**：
- 输入：“今天天气真好啊，我们去___”
- 输出：模型给每个可能的词打分，“公园”得 0.8 分，“太空”得 0.01 分……

通过让模型做几十亿道这样的“填空题”，它就学会了语言的统计规律。

### 1.2 两种预训练范式：MLM vs CLM

预训练有两种主要的训练目标，它们分别对应不同的模型架构和应用场景：

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .mlm-box { fill: #dbeafe; stroke: #3b82f6; stroke-width: 2; rx: 8; }
        .clm-box { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; rx: 8; }
        .mask-box { fill: #fee2e2; stroke: #ef4444; stroke-width: 2; rx: 4; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrow-head); fill: none; }
      </style>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <!-- MLM Section -->
    <text x="175" y="30" class="text-bold" fill="#3b82f6">MLM (Masked Language Model)</text>
    <text x="175" y="50" class="text" font-size="12">BERT, RoBERTa 等模型</text>
    <rect x="50" y="70" width="250" height="30" class="box" />
    <text x="175" y="85" class="text" font-size="12">"The [M] sat on the [M]"</text>
    <rect x="80" y="110" width="80" height="25" class="mask-box" />
    <text x="120" y="122" class="text" font-size="11">[M]</text>
    <rect x="170" y="110" width="80" height="25" class="mask-box" />
    <text x="210" y="122" class="text" font-size="11">[M]</text>
    <text x="175" y="155" class="text" font-size="12">双向注意力：看左右两边</text>
    <text x="175" y="175" class="text" font-size="11" fill="#64748b">"cat" → [M], "mat" → [M]</text>
    <rect x="50" y="195" width="250" height="30" class="mlm-box" />
    <text x="175" y="210" class="text" font-size="12">适合：理解任务（分类、问答）</text>
    <!-- CLM Section -->
    <text x="525" y="30" class="text-bold" fill="#f59e0b">CLM (Causal Language Model)</text>
    <text x="525" y="50" class="text" font-size="12">GPT, LLaMA 等模型</text>
    <rect x="400" y="70" width="250" height="30" class="box" />
    <text x="525" y="85" class="text" font-size="12">"The cat sat on the"</text>
    <path d="M 430 110 L 620 110" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow-head)"/>
    <text x="525" y="130" class="text-bold" fill="#ef4444">→</text>
    <rect x="500" y="145" width="50" height="25" class="mask-box" />
    <text x="525" y="157" class="text" font-size="11">"mat"</text>
    <text x="525" y="185" class="text" font-size="12">单向注意力：只能看左边</text>
    <text x="525" y="205" class="text" font-size="11" fill="#64748b">"The cat sat" → "on"</text>
    <rect x="400" y="225" width="250" height="30" class="clm-box" />
    <text x="525" y="240" class="text" font-size="12">适合：生成任务（写文章、对话）</text>
  </svg>
</div>

**MLM（遮盖语言模型）**：
- **代表模型**：BERT、RoBERTa
- **工作方式**：随机遮盖 15% 的词，让模型根据**左右两边**的上下文预测被遮盖的词。
- **通俗理解**：就像英语考试中的“完形填空”，让你根据上下文猜空缺单词。
- **优势**：充分利用了左右双向的上下文信息，理解能力更强。
- **弱点**：不能直接用于生成任务（因为训练时看到了完整上下文）。

**CLM（因果语言模型）**：
- **代表模型**：GPT 系列、LLaMA
- **工作方式**：给定前文，预测**下一个**词。模型只能看到**左边**的词。
- **通俗理解**：就像你写作文时，一个字一个字地往下写。
- **优势**：天生适合文本生成任务。
- **弱点**：没有利用右侧的上下文信息，理解任务上稍弱（但通过指令微调和 RLHF 可以弥补）。

  > **RLHF (Reinforcement Learning from Human Feedback)**：人类反馈强化学习。简单来说，就是让人类对模型的多个输出进行排序，然后用强化学习（如 PPO 算法）微调模型，使其生成更符合人类偏好的内容。这是 ChatGPT、Claude 等对话模型成功的关键技术。

---

## 2. Masked LM 目标函数详解

了解了两种预训练范式，我们来深入理解 MLM 的数学原理。BERT 论文中提出的具体做法非常精妙：**不是简单地替换为 [MASK]，而是采用了一种“三合一”的随机策略**。

### 2.1 遮盖策略：80% [MASK] + 10% 随机 + 10% 保持

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 280" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .word-box { fill: #f1f5f9; stroke: #cbd5e1; stroke-width: 2; rx: 4; }
        .mask-box { fill: #fee2e2; stroke: #ef4444; stroke-width: 2; rx: 4; }
        .rand-box { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; rx: 4; }
        .keep-box { fill: #dcfce7; stroke: #22c55e; stroke-width: 2; rx: 4; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrow); fill: none; }
      </style>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <!-- Original sentence -->
    <text x="350" y="30" class="text-bold">原始句子</text>
    <rect x="140" y="50" width="60" height="30" class="word-box"/>
    <text x="170" y="65" class="text" font-size="12">The</text>
    <rect x="210" y="50" width="60" height="30" class="word-box"/>
    <text x="240" y="65" class="text" font-size="12">cat</text>
    <rect x="280" y="50" width="60" height="30" class="word-box"/>
    <text x="310" y="65" class="text" font-size="12">sat</text>
    <rect x="350" y="50" width="60" height="30" class="word-box"/>
    <text x="380" y="65" class="text" font-size="12">on</text>
    <rect x="420" y="50" width="60" height="30" class="word-box"/>
    <text x="450" y="65" class="text" font-size="12">the</text>
    <rect x="490" y="50" width="60" height="30" class="word-box"/>
    <text x="520" y="65" class="text" font-size="12">mat</text>
    <!-- Random choice -->
    <text x="350" y="100" class="text" font-size="12" fill="#64748b">随机数 rand ∈ [0, 1]</text>
    <!-- Three cases -->
    <text x="120" y="140" class="text-bold" fill="#ef4444">80%</text>
    <rect x="60" y="160" width="120" height="35" class="mask-box"/>
    <text x="120" y="175" class="text-bold">[MASK]</text>
    <text x="120" y="205" class="text" font-size="11">→ 直接预测</text>
    <text x="350" y="140" class="text-bold" fill="#f59e0b">10%</text>
    <rect x="290" y="160" width="120" height="35" class="rand-box"/>
    <text x="350" y="172" class="text-bold" font-size="12">random word</text>
    <text x="350" y="205" class="text" font-size="11">→ dog, run, table...</text>
    <text x="580" y="140" class="text-bold" fill="#22c55e">10%</text>
    <rect x="520" y="160" width="120" height="35" class="keep-box"/>
    <text x="580" y="175" class="text-bold">原词</text>
    <text x="580" y="205" class="text" font-size="11">→ 保持 "cat"</text>
    <!-- Why? -->
    <rect x="150" y="230" width="400" height="35" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1" rx="4"/>
    <text x="350" y="245" class="text" font-size="12" fill="#0369a1">为什么这样设计？让模型不知道是否被替换，强制学习语义</text>
  </svg>
</div>

BERT 的解决方案非常聪明：
- **80% 用 [MASK]**：让模型学会根据上下文预测被遮盖的词。
- **10% 用随机词**：让模型不仅学习语义，还要学会区分"正确"和"错误"的词。
- **10% 保持原词**：让模型即使在看到真实词的情况下，也能学会上下文（这其实是极少数，主要起正则作用）。

**为什么要这样设计？防止模型"偷懒"！**

想象一下，如果 100% 都用 `[MASK]` 会发生什么？模型会学到：**"看到 [MASK] 这个特殊符号，我就去两边找词填空"**。这相当于给模型提供了一个"作弊线索"——`[MASK]` = "这里是答案" = "快去上下文找"。

这会有两个严重问题：
1. **推理时不会了**：真实文本中没有 `[MASK]` 标记，模型失去了作弊线索，就不会做了。
2. **没学到真正的语义**：模型只是学会了"看到 MASK 找上下文"这个表面模式，而不是真正理解词与词之间的语义关系。

这种策略的最终效果：**模型在训练时不知道遇到的是哪种情况，所以必须认认真真地理解上下文**，从而学到更 robust（鲁棒）的语义表示。就像考试时，老师不告诉你哪些是题，你必须认真对待每一个词！

### 2.2 损失函数：交叉熵

MLM 的训练目标就是让模型对被遮盖位置的预测**概率分布**，尽可能接近真实的词分布。这在数学上用**交叉熵损失（Cross-Entropy Loss）** 来衡量：

$$\mathcal{L}_{MLM} = -\sum_{i \in masked} \log P(w_i | w_{context})$$

**用现实生活来理解这个公式：**

想象你在参加一场"猜词游戏"——朋友给出一个句子，但偷偷藏起来一个词，让你猜。

- **$P(w_i | w_{context})$ 就是你的"猜测信心"**：比如句子是"猫坐在 EventListener 上"，你猜答案是"垫子"，模型给出的概率可能是 90%；如果猜答案是"月亮"，概率可能只有 0.01%。
- **$\log P$ 就是对"信心"打分**：概率越接近 1（信心越足），$\log P$ 越接近 0（惩罚越小）；概率越接近 0（完全猜错），$\log P$ 趋向负无穷（惩罚极大）。对数的作用就是**放大错误预测的痛苦**——猜错一点点和完全猜错，差距会被拉大。
- **负号 $-$**：因为 $\log P$ 本身是负数（概率小于 1），加负号后损失变成正数，方便优化器理解和最小化。
- **求和 $\sum$**：一篇文章可能有几百个被遮盖的词，每猜错一个词都要扣分，总分就是所有扣分之和。

**一句话总结：交叉熵就是在衡量"模型猜错的代价有多大"。猜得越准，损失越小；猜得越离谱，损失越大。训练的过程，就是不断调整模型参数，让这个"猜错的代价"降到最低。**

**概率分布怎么来的？**

Transformer 输出一个向量 $\mathbf{h}_i$（维度 = 词表大小），通过 **Softmax** 转为概率分布：

$$P(w | context) = \text{Softmax}(\mathbf{h}_i)_w = \frac{e^{h_i[w]}}{\sum_{v} e^{h_i[v]}}$$

Softmax 的作用就像一个 **"评分裁判"**：它接收模型对词表中每个词的原始打分（可能有正有负、有大有小），然后把所有分数压缩到 $[0, 1]$ 之间，且总和为 1。分数最高的词，概率最接近 1，就是模型的"最佳答案"。

---

## 3. 预训练流程实现

现在，让我们用代码把整个预训练流程串起来！我们将基于之前的 Transformer Block，实现一个简化版的 BERT 预训练过程。

### 3.1 预训练到底在做什么？（一句话版）

预训练就像让一个**什么都不知道的新生儿**，给他读几百万本书，让他自己总结语言规律。具体来说，就是不断重复以下过程：

1. **拿一篇文章**：从海量语料中随机抽取一段文本。
2. **挖空一些词**：随机遮盖 15% 的词（用上一篇讲的三合一策略）。
3. **让模型猜**：把挖空后的文章喂给模型，让它猜被遮盖的词是什么。
4. **打分纠错**：把模型猜测的结果和真实答案对比，计算损失（猜错的代价）。
5. **调整模型**：根据损失，微调模型的内部参数，让它下次猜得更准。

重复几十亿次后，模型就"学会"了人类语言的规律。

### 3.2 代码运行前提

> **注意**：以下代码是教学用的简化版本，目的是帮助你理解预训练的**核心流程**，并非真正可运行的完整实现。

**依赖项**：
- Python 3.7+
- PyTorch（`pip install torch`）
- 上一篇实现的核心组件：`Block`（Transformer Block）、`LayerNorm`、`FeedForward`、`CausalSelfAttention` 等（代码见 `src/pretraining.py`）

**前提条件**：
- 代码中用到的 `Block` 类来自前一篇的 Transformer 实现，这里假设它已经被导入。
- `MaskedLMHead` 和 `apply_mlm_mask` 是本篇 `src/pretraining.py` 中实现的工具类。
- 实际预训练需要海量数据（如 Wikipedia 全文、Common Crawl 等），这里用随机生成的 token ID 来模拟。

```python
import torch
import torch.nn as nn
from pretraining import MaskedLMHead, apply_mlm_mask

# 简化的 BERT 模型（用于演示）
class SimpleBERT(nn.Module):
    def __init__(self, vocab_size, n_embd, n_head, n_layer):
        super().__init__()
        # 词嵌入
        self.token_embedding = nn.Embedding(vocab_size, n_embd)
        # 位置嵌入（参考前一篇）
        self.position_embedding = nn.Embedding(512, n_embd)
        # Transformer blocks（复用之前的 Block）
        self.blocks = nn.ModuleList([Block(n_embd, n_head) for _ in range(n_layer)])
        # Layer Norm
        self.ln_f = nn.LayerNorm(n_embd)
        # MLM 头
        self.lm_head = MaskedLMHead(n_embd, vocab_size)
        
    def forward(self, x, labels=None):
        # x: (batch, seq_len)
        B, T = x.shape
        
        # 词嵌入 + 位置嵌入
        x = self.token_embedding(x) + self.position_embedding(torch.arange(T, device=x.device))
        
        # 通过 Transformer blocks
        for block in self.blocks:
            x = block(x)
        x = self.ln_f(x)
        
        # MLM 预测
        logits, loss = self.lm_head(x, labels)
        return logits, loss
```

### 3.3 训练循环

下面是预训练的核心训练循环，用通俗语言解释每一步：

```python
def train_step(model, optimizer, batch):
    """
    单步预训练 —— 就像做一道完形填空题
    """
    # 解包数据
    input_ids, attention_mask = batch
    
    # 随机遮盖（MLM）
    # 相当于老师把考卷上的 15% 的词挖空
    masked_input_ids, labels, mask_positions = apply_mlm_mask(input_ids, mask_ratio=0.15)
    
    # 前向传播
    # 相当于学生（模型）根据上下文填写答案
    logits, loss = model(masked_input_ids, labels=labels)
    
    # 反向传播
    # 相当于老师批改试卷，计算扣了多少分
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    
    return loss.item()

# 模拟训练
print("=" * 50)
print("预训练流程演示")
print("=" * 50)

# 配置
vocab_size = 10000
n_embd = 256
n_head = 8
n_layer = 6
batch_size = 4
seq_len = 128

# 模拟模型
model = SimpleBERT(vocab_size, n_embd, n_head, n_layer)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)

# 模拟数据
input_ids = torch.randint(0, vocab_size, (batch_size, seq_len))

# 训练一步
loss = train_step(model, optimizer, (input_ids, None))
print(f"Step 1 - Loss: {loss:.4f}")
print(f"模型参数量: {sum(p.numel() for p in model.parameters()):,}")
```

---

## 4. 微调：从"通才"到"专才"

预训练让模型学会了"说话"，但它不知道如何完成特定的任务。比如，一个预训练好的模型可以续写文章，但不会做情感分类。

**微调（Fine-tuning）** 就是让模型在特定任务的数据上再训练一下，让它从"通才"变成"专才"。

### 4.1 全参数微调：简单粗暴但代价高昂

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="100%" height="100%" style="max-width: 600px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f1f5f9; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .highlight { fill: #fee2e2; stroke: #ef4444; stroke-width: 2; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrow2); fill: none; }
      </style>
      <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <rect x="20" y="40" width="120" height="60" class="box"/>
    <text x="80" y="65" class="text-bold">预训练模型</text>
    <text x="80" y="85" class="text" font-size="11">175B 参数</text>
    <path d="M 140 70 L 230 70" class="arrow"/>
    <rect x="240" y="40" width="140" height="60" class="highlight"/>
    <text x="310" y="65" class="text-bold">Fine-tuning</text>
    <text x="310" y="85" class="text" font-size="11">更新全部参数</text>
    <path d="M 380 70 L 470 70" class="arrow"/>
    <rect x="480" y="40" width="100" height="60" class="box"/>
    <text x="530" y="65" class="text-bold">任务模型</text>
    <text x="530" y="85" class="text" font-size="11">175B 参数</text>
    <text x="300" y="150" class="text" font-size="12" fill="#ef4444">问题：175B × 多个任务 = 显存地狱 💀</text>
  </svg>
</div>

**全参数微调（Full Fine-tuning）** 的做法很直接：
1. 加载预训练好的大模型（如 175B 参数的 GPT-3）。
2. 在任务数据上继续训练，更新**所有**参数。
3. 保存微调后的模型。

**但问题来了**：
- **显存不够**：175B 参数的模型，需要几百 GB 显存来训练（至少需要 8 张 A100 80GB）。
- **存储昂贵**：每个下游任务都需要保存一份完整的模型权重（175GB+）。
- **数据不够**：很多垂直领域没有那么多标注数据，全参数微调容易过拟合。

于是，**参数高效微调（Parameter-Efficient Fine-Tuning, PEFT）** 技术应运而生！

---

## 5. 参数高效微调：鱼与熊掌可以兼得

参数高效微调的核心思想是：**冻结预训练模型的大部分参数，只训练极少量（通常是 1%-5%）的额外参数**。

这就像是在不改变大脑结构的情况下，通过外接一个小模块来学习新技能。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 180" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .base { fill: #f1f5f9; stroke: #94a3b8; stroke-width: 2; rx: 8; }
        .adapter { fill: #fef3c7; stroke: #f59e0b; stroke-width: 3; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
      </style>
    </defs>
    <rect x="20" y="50" width="200" height="80" class="base"/>
    <text x="120" y="80" class="text-bold">预训练模型（冻结）</text>
    <text x="120" y="105" class="text" font-size="12">175B 参数</text>
    <rect x="260" y="70" width="80" height="40" class="adapter"/>
    <text x="300" y="88" class="text-bold" fill="#b45309">+</text>
    <rect x="340" y="50" width="80" height="80" class="adapter"/>
    <text x="380" y="80" class="text-bold">小适配器</text>
    <text x="380" y="105" class="text" font-size="12">~100M 参数</text>
    <path d="M 420 90 L 460 90" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#arrow3)"/>
    <defs>
      <marker id="arrow3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <rect x="470" y="50" width="200" height="80" class="base" stroke="#22c55e" stroke-width="3"/>
    <text x="570" y="80" class="text-bold">任务模型</text>
    <text x="570" y="105" class="text" font-size="12">175B + ~0.1B 参数</text>
    <text x="570" y="130" class="text-bold" fill="#22c55e">显存节省 90%+ 🚀</text>
  </svg>
</div>

下面我们介绍三种最流行的参数高效微调方法：

### 5.1 LoRA：低秩矩阵分解的魔法

**LoRA (Low-Rank Adaptation)** 是微软提出的一种极其优雅的参数高效微调方法。它的核心思想简单到令人惊叹：**不直接修改预训练权重，而是学习一个"增量"**。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .matrix { stroke: #cbd5e1; stroke-width: 1; rx: 4; }
        .w-matrix { fill: #e2e8f0; }
        .ab-matrix { fill: #fef3c7; stroke: #f59e0b; }
        .small-matrix { fill: #dbeafe; stroke: #3b82f6; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 16px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .formula { font-family: -apple-system, sans-serif; font-size: 18px; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; font-style: italic; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#lora-arrow); fill: none; }
      </style>
      <marker id="lora-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <text x="350" y="30" class="text-bold">LoRA 核心思想</text>
    <!-- Original W -->
    <rect x="100" y="60" width="120" height="80" class="matrix w-matrix"/>
    <text x="160" y="95" class="text-bold">W₀</text>
    <text x="160" y="115" class="text" font-size="11">(d × k)</text>
    <text x="160" y="150" class="text" font-size="11" fill="#64748b">冻结</text>
    <!-- LoRA decomposition -->
    <rect x="280" y="70" width="60" height="60" class="matrix ab-matrix"/>
    <text x="310" y="95" class="text-bold">A</text>
    <text x="310" y="115" class="text" font-size="11">(d × r)</text>
    <rect x="380" y="70" width="60" height="60" class="matrix ab-matrix"/>
    <text x="410" y="95" class="text-bold">B</text>
    <text x="410" y="115" class="text" font-size="11">(r × k)</text>
    <text x="345" y="45" class="text" font-size="12" fill="#f59e0b">可训练</text>
    <path d="M 220 95 L 270 95" class="arrow"/>
    <path d="M 345 130 L 345 165" class="arrow"/>
    <!-- New W -->
    <rect x="500" y="60" width="120" height="80" class="matrix w-matrix" stroke="#22c55e" stroke-width="3"/>
    <text x="560" y="95" class="text-bold">W = W₀ + BA</text>
    <text x="560" y="115" class="text" font-size="11">(d × k)</text>
    <!-- Plus sign -->
    <text x="560" y="160" class="text-bold" fill="#22c55e">+</text>
    <text x="560" y="180" class="text" font-size="11">推理时合并</text>
    <!-- Math formula -->
    <rect x="150" y="200" width="400" height="40" fill="#f8fafc" rx="8"/>
    <text x="350" y="218" class="formula">h = W₀x + (α/r) · B A x</text>
    <text x="350" y="250" class="text" font-size="12">α 是缩放因子，通常设为 r 的 2 倍</text>
    <!-- Parameters count -->
    <rect x="220" y="260" width="260" height="30" fill="#dcfce7" rx="4"/>
    <text x="350" y="273" class="text" font-size="12" fill="#166534">参数量: 2 × d × r  vs  d × k | r=8 时节省 90%+</text>
  </svg>
</div>

**LoRA 的数学原理**：
1. 原始权重 $W_0 \in \mathbb{R}^{d \times k}$ 保持冻结。
2. 新增两个小矩阵 $A \in \mathbb{R}^{d \times r}$ 和 $B \in \mathbb{R}^{r \times k}$，其中 $r \ll \min(d, k)$（通常 r=8, 16, 32）。
3. 前向计算时：$h = W_0 x + \frac{\alpha}{r} B A x$
4. 推理时，可以把 $W = W_0 + \frac{\alpha}{r} B A$ 合并回去，完全等价于原始模型！

**通俗解释**：
- 想象你有一个巨大的书架（预训练权重），LoRA 不想搬动这些书，而是买几个小收纳盒（矩阵 A 和 B）。
- 你在收纳盒里放入新的书籍（新知识），查阅时先看收纳盒，再看书架。
- 最终效果：收纳能力（微调效果）接近重新整理整个书架（全参数微调），但只花了很少的钱和力气！

**手写 LoRA 代码**：

```python
class LoRALinear(nn.Module):
    def __init__(self, in_features, out_features, rank=8, alpha=16):
        super().__init__()
        # 原始权重（冻结）
        self.weight = nn.Parameter(torch.empty(out_features, in_features))
        self.bias = nn.Parameter(torch.empty(out_features))
        
        # LoRA 矩阵（可训练）
        self.lora_A = nn.Parameter(torch.empty(in_features, rank))
        self.lora_B = nn.Parameter(torch.empty(rank, out_features))
        
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        
        # 初始化
        nn.init.kaiming_uniform_(self.weight, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)  # B 初始化为零，保证开始时等价于原始模型
        nn.init.normal_(self.lora_A, std=0.02)
        
    def forward(self, x):
        # 原始输出
        base = F.linear(x, self.weight, self.bias)
        # LoRA 输出
        lora = (x @ self.lora_A @ self.lora_B) * self.scaling
        return base + lora
```

### 5.2 P-Tuning：虚拟 Prompt 的秘密

**P-Tuning** 是另一种流行的参数高效微调方法，它不修改模型权重，而是让模型学习一些**虚拟的 Prompt Token**。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 200" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .prompt { fill: #fef08a; stroke: #eab308; stroke-width: 2; rx: 4; }
        .text { fill: #1e293b; text-anchor: middle; dominant-baseline: middle; font-family: -apple-system, sans-serif; font-size: 14px; }
        .text-bold { font-weight: bold; fill: #0f172a; }
        .learnable { fill: #dbeafe; stroke: #3b82f6; stroke-width: 2; rx: 4; }
        .fixed { fill: #f1f5f9; stroke: #94a3b8; stroke-width: 1; rx: 4; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#pt-arrow); fill: none; }
      </style>
      <marker id="pt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <text x="350" y="25" class="text-bold">P-Tuning vs Prefix-Tuning</text>
    <!-- P-Tuning -->
    <rect x="50" y="50" width="280" height="80" rx="8" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="2"/>
    <text x="190" y="70" class="text-bold">P-Tuning</text>
    <text x="190" y="95" class="text" font-size="12">学习连续的 Prompt Embedding</text>
    <text x="190" y="115" class="text" font-size="11" fill="#64748b">只有 Embedding 层被修改</text>
    <!-- Separator -->
    <text x="350" y="88" class="text-bold" font-size="20">vs</text>
    <!-- Prefix-Tuning -->
    <rect x="370" y="50" width="280" height="80" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <text x="510" y="70" class="text-bold">Prefix-Tuning</text>
    <text x="510" y="95" class="text" font-size="12">在每层都加可学习的 Prefix</text>
    <text x="510" y="115" class="text" font-size="11" fill="#64748b">修改所有 Transformer 层</text>
    <!-- Visual -->
    <rect x="100" y="150" width="50" height="25" class="learnable"/>
    <text x="125" y="161" class="text" font-size="11">[P]</text>
    <rect x="160" y="150" width="50" height="25" class="learnable"/>
    <text x="185" y="161" class="text" font-size="11">[P]</text>
    <rect x="220" y="150" width="50" height="25" class="fixed"/>
    <text x="245" y="161" class="text" font-size="11">The</text>
    <rect x="280" y="150" width="50" height="25" class="fixed"/>
    <text x="305" y="161" class="text" font-size="11">cat</text>
    <text x="125" y="190" class="text" font-size="11" fill="#3b82f6">可学习</text>
    <text x="280" y="190" class="text" font-size="11" fill="#94a3b8">固定 Embedding</text>
  </svg>
</div>

**P-Tuning 的核心思想**：
- 不像人工 Prompt 那样使用离散的文本 token，而是让模型学习**连续的向量**作为 Prompt。
- 这些向量通过一个小型 MLP（编码器）进行投影，然后直接加到输入 Embedding 前面。
- 可训练参数量：Prompt Embedding + 小的 MLP。

**Prefix-Tuning** 更进一步：不在只是在 Embedding 层加 Prompt，而是在**每个 Transformer 层的输入**都加上可学习的前缀。

### 5.3 对比：什么时候用哪个？

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 250" width="100%" height="100%" style="max-width: 650px; margin: 20px 0;">
    <defs>
      <style>
        .table-header { fill: #1e293b; }
        .table-row { fill: #f8fafc; stroke: #e2e8f0; }
        .table-row-alt { fill: #f1f5f9; stroke: #e2e8f0; }
        .text { font-family: -apple-system, sans-serif; font-size: 12px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-weight: bold; fill: #0f172a; }
      </style>
    </defs>
    <rect x="0" y="0" width="650" height="35" class="table-header"/>
    <text x="108" y="20" class="text" fill="white" font-weight="bold">方法</text>
    <text x="270" y="20" class="text" fill="white" font-weight="bold">参数量</text>
    <text x="432" y="20" class="text" fill="white" font-weight="bold">效果</text>
    <text x="595" y="20" class="text" fill="white" font-weight="bold">适用场景</text>
    <!-- Row 1 -->
    <rect x="0" y="35" width="650" height="45" class="table-row"/>
    <text x="108" y="55" class="text-bold">Full Fine-tuning</text>
    <text x="270" y="55" class="text">100%</text>
    <text x="432" y="55" class="text">⭐⭐⭐⭐⭐</text>
    <text x="595" y="55" class="text" font-size="11">数据充足，有多卡</text>
    <!-- Row 2 -->
    <rect x="0" y="80" width="650" height="45" class="table-row-alt"/>
    <text x="108" y="100" class="text-bold" fill="#22c55e">LoRA</text>
    <text x="270" y="100" class="text">~0.5-2%</text>
    <text x="432" y="100" class="text">⭐⭐⭐⭐</text>
    <text x="595" y="100" class="text" font-size="11">通用场景，效果稳定</text>
    <!-- Row 3 -->
    <rect x="0" y="125" width="650" height="45" class="table-row"/>
    <text x="108" y="145" class="text-bold" fill="#3b82f6">P-Tuning</text>
    <text x="270" y="145" class="text">~0.1-0.5%</text>
    <text x="432" y="145" class="text">⭐⭐⭐</text>
    <text x="595" y="145" class="text" font-size="11">显存极度受限</text>
    <!-- Row 4 -->
    <rect x="0" y="170" width="650" height="45" class="table-row-alt"/>
    <text x="108" y="190" class="text-bold" fill="#f59e0b">Prefix-Tuning</text>
    <text x="270" y="190" class="text">~1-3%</text>
    <text x="432" y="190" class="text">⭐⭐⭐⭐</text>
    <text x="595" y="190" class="text" font-size="11">需要更强表达能力</text>
    <!-- Row 5 -->
    <rect x="0" y="215" width="650" height="35" class="table-row"/>
    <text x="108" y="230" class="text-bold" fill="#8b5cf6">LoRA + 量化 (QLoRA)</text>
    <text x="270" y="230" class="text" font-size="11">~0.1%</text>
    <text x="432" y="230" class="text">⭐⭐⭐⭐</text>
    <text x="595" y="230" class="text" font-size="11">单卡消费级 GPU</text>
  </svg>
</div>

---

## 6. 总结

在这篇文章中，我们深入剖析了大模型"学会说话"的核心机制：

1. **预训练的目标函数**：MLM（完形填空）和 CLM（因果预测）分别代表了两种不同的预训练范式。MLM 通过双向上下文理解世界，CLM 通过单向生成锻炼语言能力。

2. **全参数微调**：简单直接，但代价高昂——需要海量显存和计算资源。

3. **参数高效微调**：
   - **LoRA**：通过低秩矩阵分解，让模型学习"权重增量"，训练参数量减少 90%+，效果几乎不输全参数微调。
   - **P-Tuning**：通过学习虚拟 Prompt，在 Embedding 层面注入任务知识。
   - **Prefix-Tuning**：在每一层都加入可学习前缀，表达能力更强。

4. **最佳实践**：如果你只有一块消费级 GPU，**QLoRA（LoRA + 量化）** 是目前最流行的解决方案，可以在 8GB 显存下微调 70B 参数的模型！

在后续的文章中，我们将继续探索提示工程、记忆系统（RAG）、工具调用等更深入的话题。敬请期待！

---

## 参考文献与延伸阅读

1. **BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding (Devlin et al., 2018)**：BERT 的开山之作，提出了 MLM + NSP 预训练目标。
   - 链接：<a href="https://arxiv.org/abs/1810.04805" target="_blank">https://arxiv.org/abs/1810.04805</a>

2. **LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)**：LoRA 的原始论文，详细推导了低秩矩阵分解的数学原理。
   - 链接：<a href="https://arxiv.org/abs/2106.09685" target="_blank">https://arxiv.org/abs/2106.09685</a>

3. **GPT-3: Language Models are Few-Shot Learners (Brown et al., 2020)**：展示了大规模预训练的强大能力，以及 In-Context Learning 的魅力。
   - 链接：<a href="https://arxiv.org/abs/2005.14165" target="_blank">https://arxiv.org/abs/2005.14165</a>

4. **Prefix-Tuning: Optimizing Continuous Prompts for Generation (Li & Liang, 2021)**：Prefix-Tuning 的原始论文。
   - 链接：<a href="https://arxiv.org/abs/2101.00190" target="_blank">https://arxiv.org/abs/2101.00190</a>

5. **P-Tuning: Prompt Tuning Can Make Language Models Better Few-Shot Learners (Liu et al., 2021)**：P-Tuning v1 版本。
   - 链接：<a href="https://arxiv.org/abs/2103.10385" target="_blank">https://arxiv.org/abs/2103.10385</a>

6. **QLoRA: Efficient Finetuning of Quantized LLMs (Detmers et al., 2023)**：在消费级 GPU 上微调大模型的神器。
   - 链接：<a href="https://arxiv.org/abs/2305.14314" target="_blank">https://arxiv.org/abs/2305.14314</a>
