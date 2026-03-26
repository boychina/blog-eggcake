---
title: "AI 技术演进与核心算法实战 | 第五篇：Transformer 架构深潜：Positional Encoding、Layer Norm 与前馈网络的手写实现（NanoGPT 复现）"
excerpt: "彻底搞懂 Transformer 的各个组件：位置编码如何注入时序信息？Layer Norm 为什么是深层网络训练的关键？FFN 的作用是什么？基于 NanoGPT 手写复现核心代码。"
description: "AI 技术演进与核心算法实战第五篇：Transformer 架构深潜：Positional Encoding、Layer Norm 与前馈网络的手写实现"
keyword: "AI,大模型,Transformer,Positional Encoding,Layer Norm,FFN,NanoGPT"
tag: "AI"
date: "2025-10-22 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战-第五篇：Transformer-架构深潜：Positional-Encoding、Layer-Norm-与前馈网络的手写实现（NanoGPT-复现）/cover/transformer-architecture.svg"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战-第五篇：Transformer-架构深潜：Positional-Encoding、Layer-Norm-与前馈网络的手写实现（NanoGPT-复现）/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战-第五篇：Transformer-架构深潜：Positional-Encoding、Layer-Norm-与前馈网络的手写实现（NanoGPT-复现）/cover/transformer-architecture.svg"
---

> Self-Attention 是 Transformer 的灵魂，但只有灵魂还不够，它还需要一副强大的躯壳。今天，我们就来拼装这副躯壳。

在[上一篇](4.AI%20%E6%8A%80%E6%9C%AF%E6%BC%94%E8%BF%9B%E4%B8%8E%E6%A0%B8%E5%BF%83%E7%AE%97%E6%B3%95%E5%AE%9E%E6%88%98%20-%20%E7%AC%AC%E5%9B%9B%E7%AF%87%EF%BC%9A%E6%B3%A8%E6%84%8F%E5%8A%9B%E6%9C%BA%E5%88%B6%E8%A7%A3%E5%AF%86%EF%BC%9ASelf-Attention%20%E7%9A%84%E7%9F%A9%E9%98%B5%E8%BF%90%E7%AE%97%E5%9B%BE%E8%A7%A3%E4%B8%8E%20Q,K,V%20%E7%9A%84%E7%89%A9%E7%90%86%E6%84%8F%E4%B9%89/)中，我们解密了 Self-Attention 的核心机制，明白了词与词之间是如何通过 Q、K、V 进行动态交流的。然而，纯粹的 Attention 机制有两个致命的缺陷：

1. **它是“色盲”加“脸盲”的（丢失位置信息）**：Self-Attention 将输入视为一个“无序的词袋”，无论“狗咬人”还是“人咬狗”，计算出的 Attention 分数是一样的，因为它完全不知道词的顺序。
2. **它容易“营养不良”或“走火入魔”（梯度问题与特征表达能力不足）**：仅靠线性变换的 Attention，无法拟合复杂的非线性语言规律，同时深层网络极易出现梯度消失或爆炸。

为了解决这些问题，Transformer 引入了三大法宝：**位置编码（Positional Encoding）**、**层归一化（Layer Normalization）**和**前馈网络（Feed-Forward Network, FFN）**。

本篇是 **《AI 技术演进与核心算法实战》第一模块的第五篇**。我们将结合 Andrej Karpathy 的 `NanoGPT` 项目，用手写代码和图解，带你彻底搞透这三大组件的底层逻辑，并最终拼装出一个完整的 Transformer Block！

---

## 1. 注入时间之魂：Positional Encoding

为什么 Transformer 那么快？因为它用“并行计算”取代了 RNN 的“串行计算”。
但代价是什么？代价是丢失了时序信息。

为了让模型知道每个词在句子中的位置，我们需要给每个词贴上一个“位置标签”。这就是位置编码（Positional Encoding）。

### 1.1 绝对位置编码的直觉

最简单的想法是：第一个词贴上标签 1，第二个词贴上 2……
但这样做会引发两个致命问题：

1. **特征在数值上被“淹没”（尺度失衡）**
   在深度学习中，Embedding 层输出的词向量数值通常非常小（分布在 $[-1, 1]$ 附近）。如果位置索引是 1000，并且与词向量直接相加（`1000 + 0.3 = 1000.3`），原本代表单词核心语义的微小数值就会在巨大的位置数值面前显得微乎其微。这会导致网络过度关注“位置”，而忽略了“语义”，同时极大的输入值容易让后续的激活函数进入饱和区，造成梯度消失。

2. **模型难以泛化到更长的句子（外推性崩溃）**
   如果模型在训练时最多只见过 512 个词长度的句子，它的权重参数只适应了 `1` 到 `512` 这样的位置数值。当推理阶段遇到长度为 1000 的句子时，`513` 到 `1000` 属于模型从未见过的**分布外（OOD）巨大数值**。这些异常输入会导致神经网络输出不可预测的巨大激活值，使模型完全崩溃。

为了解决这两个痛点，Google 在论文中给出了一个极其优雅的解法：**使用不同频率的正弦和余弦函数**。

三角函数（$\sin$ 和 $\cos$）的值域永远被限制在 $[-1, 1]$ 之间，完美解决了**特征被淹没**的问题。同时，三角函数的周期性规律不仅能帮助模型计算相对距离，还具备平滑延伸的特性，极大缓解了**长度泛化困难**的问题。

想象一个二进制计数器：
- 个位：`0 1 0 1 0 1...`（变化极快）
- 十位：`0 0 1 1 0 0...`（变化中等）
- 百位：`0 0 0 0 1 1...`（变化极慢）

Transformer 的位置编码也是类似原理，只是把离散的 0 和 1 换成了连续的 `sin` 和 `cos` 曲线。向量的第一维变化最快（高频），最后一维变化最慢（低频）。

### 1.2 图解位置编码

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 250" width="100%" height="100%" style="max-width: 600px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .wave1 { fill: none; stroke: #ef4444; stroke-width: 2; }
        .wave2 { fill: none; stroke: #3b82f6; stroke-width: 2; }
        .wave3 { fill: none; stroke: #10b981; stroke-width: 2; }
      </style>
    </defs>
    <rect x="50" y="20" width="120" height="40" class="box" />
    <text x="110" y="40" class="text-bold">词 Embedding</text>
    <text x="210" y="40" class="text-bold" font-size="20">+</text>
    <rect x="250" y="20" width="120" height="40" class="box" />
    <text x="310" y="40" class="text-bold">位置 Encoding</text>
    <text x="410" y="40" class="text-bold" font-size="20">=</text>
    <rect x="450" y="20" width="120" height="40" class="box" fill="#e0f2fe" stroke="#38bdf8" />
    <text x="510" y="40" class="text-bold">带有位置的输入</text>
    <path d="M 260 100 Q 280 60 300 100 T 340 100 T 380 100 T 420 100" class="wave1" />
    <path d="M 260 140 Q 300 60 340 140 T 420 140" class="wave2" />
    <path d="M 260 180 Q 340 60 420 180" class="wave3" />
    <text x="180" y="100" class="text" font-size="12">高频 (维 0)</text>
    <text x="180" y="140" class="text" font-size="12">中频 (维 d/2)</text>
    <text x="180" y="180" class="text" font-size="12">低频 (维 d)</text>
  </svg>
</div>

**图解说明：**
从上图中我们可以直观地看到 Transformer 注入位置信息的过程：
1. **直接相加（Add）**：位置编码（Positional Encoding）的维度与词向量（Token Embedding）完全相同，两者通过**元素级相加**（Element-wise Addition）融合在一起，形成最终“带有位置的输入”。
2. **频率递减的波形**：图中下方的三条波浪线代表了位置编码向量中不同维度的数值变化规律。
   - **高频（红色波浪）**：对应向量的较前维度（如维度 0）。波峰波谷变化非常密集，类似于二进制中的“个位”，对相邻位置极其敏感，用于区分近距离的词。
   - **中频（蓝色波浪）**：对应向量的中间维度。波长变长，变化适中。
   - **低频（绿色波浪）**：对应向量的较后维度（如维度 d）。波形非常平缓，类似于二进制中的“百位”，在一个较长的句子范围内才完成一次周期变化，帮助模型感知词在句子中的宏观/全局相对位置。

### 1.3 手写实现（PyTorch）

在目前的实践中（如 GPT 系列），通常采用更简单的**可学习的位置嵌入（Learned Positional Embedding）**，而不是固定的正余弦。NanoGPT 采用的正是这种方案：

```python
import torch
import torch.nn as nn

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
```

**物理意义：**
词的最终表达 = “它是什么意思”（Token Embedding） + “它在哪个位置”（Positional Embedding）。这两者在向量空间中完美融合。

---

## 2. 驯服狂暴的梯度：Layer Normalization

当我们在堆叠多层 Self-Attention 时，数值会变得非常大，导致梯度爆炸，网络根本无法收敛。
为了让每一层的输出“冷静”下来，我们需要 **Layer Normalization（层归一化）**。

### 2.1 为什么是 Layer Norm 而不是 Batch Norm？

在图像领域（CNN），大家习惯用 Batch Norm（批归一化），它是跨越 Batch 对同一个通道进行归一化。
但在自然语言中，句子的长度是不一样的（有长有短），如果跨句子求平均，长句后面的词只能和填充（Padding）的 0 一起算，这毫无意义。

因此，NLP 中采用 **Layer Norm**：**在每一个词的词向量内部进行归一化**。不管句子多长，每个词管好自己的向量就行。

### 2.2 图解 Layer Norm

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="100%" height="100%" style="max-width: 600px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 4; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .highlight { fill: #fee2e2; stroke: #ef4444; stroke-width: 2; rx: 4; }
        .arrow { stroke: #94a3b8; stroke-width: 2; marker-end: url(#arrow2); fill: none; }
      </style>
      <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
    </defs>
    <text x="100" y="30" class="text-bold">Batch Norm</text>
    <rect x="50" y="60" width="30" height="100" class="highlight" />
    <rect x="90" y="60" width="30" height="100" class="box" />
    <rect x="130" y="60" width="30" height="100" class="box" />
    <text x="100" y="180" class="text" font-size="12">跨样本同维度计算</text>
    <text x="400" y="30" class="text-bold">Layer Norm</text>
    <rect x="300" y="60" width="100" height="20" class="highlight" />
    <rect x="300" y="90" width="100" height="20" class="box" />
    <rect x="300" y="120" width="100" height="20" class="box" />
    <text x="350" y="180" class="text" font-size="12">单样本同词汇内部计算</text>
    <path d="M 200 110 L 250 110" class="arrow" />
    <text x="225" y="90" class="text" font-size="12">NLP首选</text>
  </svg>
</div>

### 2.3 手写实现（核心逻辑）

Layer Norm 的公式很简单：先减去均值，再除以标准差，最后乘上缩放参数 `gamma`，加上平移参数 `beta`。

```python
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
```

---

## 3. 赋予思考的深度：前馈网络（FFN）

Self-Attention 虽然强大，但它只做了一件事：**让词与词之间交换信息**。这本质上只是一个复杂的加权求和（线性变换）。
如果全是线性变换，多层网络就会退化成一层。我们需要非线性激活函数，这就是前馈网络（Feed-Forward Network, FFN）的作用。

### 3.1 放大与压缩的艺术

在 Transformer 中，FFN 的结构非常经典：
1. **升维**：先将维度放大 4 倍（`n_embd -> 4 * n_embd`）。
2. **非线性**：通过激活函数（如 GELU 或 ReLU）进行非线性映射。
3. **降维**：再将维度压缩回原来的大小（`4 * n_embd -> n_embd`）。

**物理意义：**
Self-Attention 负责“收集资料”（看上下文），而 FFN 负责“闭门思考”（在单个词内部进行复杂的非线性逻辑推理）。升维的目的是提供更大的空间去记忆和组合特征。

### 3.2 手写实现

```python
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
```

---

## 4. 拼装神迹：构建完整的 Transformer Block

现在，我们有了 Self-Attention（上篇）、Layer Norm 和 FFN。是时候把它们组装成一个真正的 Transformer Block 了！

在早期的 Transformer（如原始论文）中，Layer Norm 放在 Attention 之后（Post-LN）。但实践证明，**将 Layer Norm 放在 Attention 之前（Pre-LN）能让训练极其稳定**，GPT 家族全部采用了 Pre-LN 架构。

### 4.1 架构图解（Pre-LN）

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%" style="max-width: 400px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .ln-box { fill: #fef08a; stroke: #eab308; stroke-width: 2; rx: 8; }
        .att-box { fill: #fee2e2; stroke: #ef4444; stroke-width: 2; rx: 8; }
        .ffn-box { fill: #dcfce3; stroke: #22c55e; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 14px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrow-head); fill: none; }
        .skip { stroke: #64748b; stroke-width: 2; marker-end: url(#arrow-head); fill: none; stroke-dasharray: 4 4; }
      </style>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <!-- Nodes -->
    <rect x="150" y="20" width="100" height="40" class="box" />
    <text x="200" y="40" class="text-bold">Input</text>
    <rect x="150" y="100" width="100" height="40" class="ln-box" />
    <text x="200" y="120" class="text-bold">Layer Norm</text>
    <rect x="120" y="180" width="160" height="40" class="att-box" />
    <text x="200" y="200" class="text-bold">Self-Attention</text>
    <circle cx="200" cy="260" r="15" fill="#f8fafc" stroke="#64748b" stroke-width="2" />
    <text x="200" y="260" class="text-bold">+</text>
    <rect x="150" y="320" width="100" height="40" class="ln-box" />
    <text x="200" y="340" class="text-bold">Layer Norm</text>
    <rect x="120" y="400" width="160" height="40" class="ffn-box" />
    <text x="200" y="420" class="text-bold">Feed Forward</text>
    <circle cx="200" cy="480" r="15" fill="#f8fafc" stroke="#64748b" stroke-width="2" />
    <text x="200" y="480" class="text-bold">+</text>
    <!-- Edges -->
    <path d="M 200 60 L 200 100" class="arrow" />
    <path d="M 200 140 L 200 180" class="arrow" />
    <path d="M 200 220 L 200 245" class="arrow" />
    <path d="M 200 275 L 200 320" class="arrow" />
    <path d="M 200 360 L 200 400" class="arrow" />
    <path d="M 200 440 L 200 465" class="arrow" />
    <!-- Residual Connections (Skip) -->
    <path d="M 200 80 L 100 80 L 100 260 L 185 260" class="skip" />
    <path d="M 200 290 L 100 290 L 100 480 L 185 480" class="skip" />
    <text x="70" y="170" class="text" font-size="12">残差连接</text>
    <text x="70" y="385" class="text" font-size="12">残差连接</text>
  </svg>
</div>

### 4.2 NanoGPT 源码复现

结合图解，我们用代码将它们串联起来。注意残差连接（`x = x + ...`）的运用，它是深层网络能够训练成功的另一个关键。

```python
class Block(nn.Module):
    def __init__(self, n_embd, n_head):
        super().__init__()
        # 1. 归一化层 1
        self.ln_1 = LayerNorm(n_embd)
        # 2. 多头自注意力机制 (我们在上一篇详细讲过)
        # 这里假设 CausalSelfAttention 已经实现好
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
```

至此，一个完整的 Transformer 积木块就诞生了！现代的 GPT 模型，比如 GPT-3 或 LLaMA，本质上就是把这个 `Block` 重复堆叠了几十层。

---

## 5. 总结

在这篇文章中，我们为裸奔的 Self-Attention 穿上了神装：
1. **Positional Encoding** 赋予了模型时间的概念，让模型不再脸盲。
2. **Layer Norm** 稳定了数值波动，降伏了狂暴的梯度。
3. **FFN** 提供了非线性的推理空间，让模型拥有了真正的“思考”能力。
4. **残差连接 (Residual Connection)** 搭建了信息的高速公路，使得几十上百层的网络依然能够顺畅反向传播。

在下一篇中，我们将进入实战环节：**预训练与微调**。我们将揭秘大模型是如何通过 Masked LM 或 Causal LM 目标函数“读遍天下书”的，并深入探讨 LoRA/P-Tuning 等让普通玩家也能玩转大模型的高效微调黑科技。敬请期待！

---

## 参考文献与延伸阅读

1. **Attention Is All You Need (Vaswani et al., 2017)**：Transformer 架构的开山之作。
   - 链接：<a href="https://arxiv.org/abs/1706.03762" target="_blank">https://arxiv.org/abs/1706.03762</a>
2. **NanoGPT by Andrej Karpathy**：用极其简洁优雅的代码复现了 GPT，是学习大模型底层实现最好的开源项目。
   - GitHub：<a href="https://github.com/karpathy/nanoGPT" target="_blank">https://github.com/karpathy/nanoGPT</a>
3. **Layer Normalization (Ba et al., 2016)**：详细阐述了为什么在 RNN 和 NLP 任务中 Layer Norm 优于 Batch Norm。
   - 链接：<a href="https://arxiv.org/abs/1607.06450" target="_blank">https://arxiv.org/abs/1607.06450</a>
4. **On Layer Normalization in the Transformer Architecture (Xiong et al., 2020)**：论证了 Pre-LN 相对于 Post-LN 的稳定性优势。
   - 链接：<a href="https://arxiv.org/abs/2002.04745" target="_blank">https://arxiv.org/abs/2002.04745</a>
