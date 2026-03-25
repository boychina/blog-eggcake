---
title: "AI 技术演进与核心算法实战 | 第三篇：向量的语义世界：Embedding 原理、Word2Vec 到 Transformer 的向量空间演化"
excerpt: "在理解了 Token 之后，AI 是如何理解词汇含义的？从 Word2Vec 的诞生，到 Transformer 的高维语义空间，手写一个极简 Embedding 模型带你探索词汇的坐标系。"
description: "AI 技术演进与核心算法实战第三篇：向量的语义世界：Embedding 原理、Word2Vec 到 Transformer 的向量空间演化"
keyword: "AI,大模型,Agent,Embedding,Word2Vec,Transformer,向量空间,NLP"
tag: "AI"
date: "2025-10-01 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战-第三篇：向量的语义世界：Embedding-原理、Word2Vec-到-Transformer-的向量空间演化/cover/embedding-word2vec.png"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战-第三篇：向量的语义世界：Embedding-原理、Word2Vec-到-Transformer-的向量空间演化/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战-第三篇：向量的语义世界：Embedding-原理、Word2Vec-到-Transformer-的向量空间演化/cover/embedding-word2vec.png"
---

> 万物皆可 Embedding。如果说 Token 是 AI 世界的原子，那么 Embedding 就是连接这些原子的化学键。

在上一篇中，我们通过 BPE 算法将文本切分成了模型可以接受的基本单位——Token，并给每个 Token 分配了一个唯一的数字 ID。

但这里有一个致命的问题：**数字本身是不携带语义的。**

假设在词汇表中，`"苹果"` 的 ID 是 `100`，`"香蕉"` 的 ID 是 `101`，`"汽车"` 的 ID 是 `999`。如果模型仅仅看着这些离散的数字，它会认为 `"苹果"` 和 `"香蕉"` 之间的关系，就像 `100` 和 `101` 的关系；而 `"苹果"` 和 `"汽车"` 的关系就像 `100` 和 `999` 的关系。

这显然荒谬到了极点！在人类的常识中，苹果和香蕉都是水果，它们在语义上应该非常“接近”；而汽车和苹果八竿子打不着，它们应该离得很远。

如何让模型不仅认识这些词，还能理解词与词之间的**关系与距离**？

这就是本篇要探讨的核心：**Embedding（词向量）技术**。它是连接符号世界与连续高维空间的桥梁，也是 Transformer 乃至整个大模型能够理解语言含义的基础。

---

## 1. 独热编码 (One-Hot)：高维空间的“孤岛”

在 Embedding 出现之前，早期 NLP 最朴素的做法是**独热编码（One-Hot Encoding）**。

假设我们的词汇表里只有 4 个词：`["苹果", "香蕉", "汽车", "猫"]`。
独热编码会为每个词分配一个长度为 4 的向量，除了它自己对应的位置是 `1`，其余全为 `0`：
*   `苹果` = `[1, 0, 0, 0]`
*   `香蕉` = `[0, 1, 0, 0]`
*   `汽车` = `[0, 0, 1, 0]`
*   `猫` = `[0, 0, 0, 1]`

**致命缺陷：**
1. **维度灾难**：如果大模型词汇表有 10 万个 Token，那么每个词都是一个 10 万维的向量，且其中 99999 个位置都是 `0`，这种极其稀疏的矩阵会让计算资源直接崩溃。
2. **毫无语义关联**：在数学上，任意两个不同独热向量的内积（点乘）永远为 `0`。这意味着，在向量空间中，**任意两个词之间的夹角都是 90 度（正交），它们互不相干。** 苹果和香蕉的距离，与苹果和汽车的距离完全一样。这被称为“语义鸿沟”。

---

## 2. Word2Vec：开启词向量革命

2013 年，Google 团队的 Tomas Mikolov 提出了一项彻底改变 NLP 历史的算法：**Word2Vec**。

它的核心理念非常具有哲学意味，源自语言学家 Firth (1957) 的名言：
> *"You shall know a word by the company it keeps." (通过一个词周围的邻居，就能知道它的含义。)*

Word2Vec 放弃了人工标注特征，转而**让神经网络去阅读海量文本，通过“猜词”游戏，强行逼迫模型学习到词汇的隐含特征（Dense Vector，稠密向量）。**

### 两种经典的“猜词”玩法

Word2Vec 提出了两种架构来学习 Embedding：
1. **CBOW (Continuous Bag of Words)**：根据上下文，猜中间的词。
   *(例如："我 昨天 吃了 一个 [苹果] 味道 很 甜"，通过周围的词猜中间的 "苹果")*
2. **Skip-gram**：根据中间的词，猜周围的上下文。
   *(例如：已知中间词是 "苹果"，让模型去预测它周围可能会出现 "吃"、"甜"、"水果" 等词)*

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #3b82f6; stroke-width: 2; rx: 8; ry: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .title { font-weight: bold; font-size: 16px; fill: #0f172a; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrowhead); fill: none; }
      </style>
      <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <!-- CBOW -->
    <text x="150" y="30" class="text title">CBOW (根据上下文猜目标词)</text>
    <rect x="50" y="70" width="80" height="40" class="box" />
    <text x="90" y="90" class="text">w(t-2)</text>
    <rect x="50" y="120" width="80" height="40" class="box" />
    <text x="90" y="140" class="text">w(t-1)</text>
    <rect x="50" y="170" width="80" height="40" class="box" />
    <text x="90" y="190" class="text">w(t+1)</text>
    <rect x="50" y="220" width="80" height="40" class="box" />
    <text x="90" y="240" class="text">w(t+2)</text>
    <circle cx="200" cy="155" r="25" fill="#e2e8f0" stroke="#64748b" stroke-width="2" />
    <text x="200" y="155" class="text">Sum</text>
    <rect x="260" y="135" width="80" height="40" class="box" fill="#dcfce3" />
    <text x="300" y="155" class="text">w(t)</text>
    <path d="M 130 90 L 180 145" class="arrow" />
    <path d="M 130 140 L 175 155" class="arrow" />
    <path d="M 130 190 L 175 155" class="arrow" />
    <path d="M 130 240 L 180 165" class="arrow" />
    <path d="M 225 155 L 255 155" class="arrow" />
    <!-- Skip-gram -->
    <text x="550" y="30" class="text title">Skip-gram (根据目标词猜上下文)</text>
    <rect x="420" y="135" width="80" height="40" class="box" fill="#e0f2fe" />
    <text x="460" y="155" class="text">w(t)</text>
    <rect x="570" y="70" width="80" height="40" class="box" />
    <text x="610" y="90" class="text">w(t-2)</text>
    <rect x="570" y="120" width="80" height="40" class="box" />
    <text x="610" y="140" class="text">w(t-1)</text>
    <rect x="570" y="170" width="80" height="40" class="box" />
    <text x="610" y="190" class="text">w(t+1)</text>
    <rect x="570" y="220" width="80" height="40" class="box" />
    <text x="610" y="240" class="text">w(t+2)</text>
    <path d="M 500 155 L 565 90" class="arrow" />
    <path d="M 500 155 L 565 140" class="arrow" />
    <path d="M 500 155 L 565 190" class="arrow" />
    <path d="M 500 155 L 565 240" class="arrow" />
  </svg>
</div>

经过这种海量文本的自我博弈（自监督学习），原本毫无关联的词，被映射成了一个个**几百维的浮点数向量（Dense Vector）**。

奇迹发生了：**在这些多维向量的坐标系中，语义相近的词，它们在空间里的距离也越近。** 更有趣的是，它们不仅有位置，还具有了“线性加减”的代数性质！

最著名的例子就是：
$$ Vector("King") - Vector("Man") + Vector("Woman") \approx Vector("Queen") $$

这说明模型不仅记住了词，还提取出了“性别”、“阶级”这些人类难以用规则去写清楚的抽象语义维度！

---

## 3. 词汇的坐标系：从代码看 Embedding 的本质

为了让你不再觉得这是一个黑盒，我们用 NumPy 手写一个极简版的 Word2Vec (基于 Skip-gram)。

> 如果你想直接获取完整可运行的源码，可以在本文配套文章目录的 `src/word2vec_demo.py` 中找到。

```python
import numpy as np

class SimpleWord2Vec:
    """
    一个极简的基于 NumPy 的 Skip-gram 模型实现。
    主要用于演示 Word2Vec 中词向量是如何通过梯度下降学习到的。
    """
    def __init__(self, vocab_size: int, embedding_dim: int, learning_rate: float = 0.01):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.learning_rate = learning_rate
        
        # W1 是输入词矩阵 (V x D)，也就是我们最终要提取的 Embedding 矩阵！
        self.W1 = np.random.randn(vocab_size, embedding_dim) * 0.01
        # W2 是输出词矩阵 (D x V)，用于预测上下文
        self.W2 = np.random.randn(embedding_dim, vocab_size) * 0.01

    def forward(self, target_word_index: int):
        # 1. 查表（相当于用独热编码乘以 W1 矩阵，直接提取出该词对应的向量）
        h = self.W1[target_word_index]
        # 2. 计算输出层的 logits
        u = np.dot(h, self.W2)
        # 3. Softmax 转化为概率分布
        y_pred = np.exp(u) / np.sum(np.exp(u))
        return h, u, y_pred

    def backward(self, target_word_index: int, context_word_index: int, h, y_pred):
        # 计算预测误差 (目标上下文词的理想概率是 1)
        e = y_pred.copy()
        e[context_word_index] -= 1.0  
        # 反向传播计算梯度
        dW2 = np.outer(h, e)
        dh = np.dot(self.W2, e)
        # 梯度下降，更新权重（这就是模型“学习”语义的过程）
        self.W2 -= self.learning_rate * dW2
        self.W1[target_word_index] -= self.learning_rate * dh
```

你看，所谓的 Embedding 矩阵（在 PyTorch 中就是 `nn.Embedding`），本质上就是一个**庞大的查找表（Lookup Table）**。它的行数是词汇表的大小，列数是向量的维度（如 GPT-3 中的 12288 维）。模型输入一个 Token ID，就直接去表里把对应那一行的数组“抽”出来，这个数组就是该 Token 的“灵魂坐标”。

> 你可以尝试修改我给的语料库，看看模型的学习效果如何。

---

## 4. 从 Word2Vec 到 Transformer：语境的演化

Word2Vec 已经很强了，但它有一个天生的硬伤：**静态词向量（Static Embedding）**。

在 Word2Vec 的查找表里，一个词永远只有一个固定的向量。但人类语言充满了**多义词**。
比如单词 `"bank"`：
*   在 `"I went to the bank to deposit money."` 中，它是“银行”。
*   在 `"I sat on the river bank."` 中，它是“河岸”。

如果 `"bank"` 的向量是固定的，那它怎么可能同时表示“银行”和“河岸”呢？模型最后只能取一个这两种含义的平均值，导致在任何场景下都不够准确。

这就是 Transformer（以及 ELMo、BERT）必须解决的问题：**动态/上下文相关的词向量（Contextualized Embedding）**。

### Self-Attention 如何改变向量空间

在现代的大模型中，当一段文本被转换为初始的 Embedding 之后，这仅仅是个开始。这些向量随后会被送入 Transformer 的**注意力机制（Self-Attention）** 网络层中。

在这个过程中，每一个 Token 都会环顾四周（Context），并**动态地吸收周围 Token 的语义特征，从而修改自己的向量。**

在经过多层 Transformer 的洗礼后，`"bank"` 这个 Token 的向量，在遇到 `"money"` 时，会向“金融”的维度偏移；而在遇到 `"river"` 时，会向“水体”的维度偏移。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 250" width="100%" height="100%" style="max-width: 600px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f1f5f9; stroke: #94a3b8; stroke-width: 2; rx: 4; ry: 4; }
        .box-active { fill: #e0f2fe; stroke: #3b82f6; stroke-width: 2; rx: 4; ry: 4; }
        .text { font-family: -apple-system, sans-serif; font-size: 14px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .line { stroke: #cbd5e1; stroke-width: 2; stroke-dasharray: 4,4; }
        .arrow { stroke: #3b82f6; stroke-width: 2; marker-end: url(#arrowhead2); fill: none; }
      </style>
      <marker id="arrowhead2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
      </marker>
    </defs>
    <!-- Sentence 1 -->
    <text x="150" y="30" class="text" font-weight="bold">句子 A: river bank</text>
    <rect x="70" y="60" width="60" height="30" class="box" />
    <text x="100" y="75" class="text">river</text>
    <rect x="170" y="60" width="60" height="30" class="box-active" />
    <text x="200" y="75" class="text">bank</text>
    <path d="M 100 90 Q 150 130 200 90" class="arrow" />
    <text x="150" y="125" class="text" font-size="12" fill="#64748b">吸收 "river" 特征</text>
    <rect x="170" y="160" width="60" height="30" class="box-active" fill="#dcfce3" stroke="#22c55e" />
    <text x="200" y="175" class="text">bank_v1</text>
    <line x1="200" y1="90" x2="200" y2="160" class="arrow" />
    <!-- Sentence 2 -->
    <text x="450" y="30" class="text" font-weight="bold">句子 B: money bank</text>
    <rect x="370" y="60" width="60" height="30" class="box" />
    <text x="400" y="75" class="text">money</text>
    <rect x="470" y="60" width="60" height="30" class="box-active" />
    <text x="500" y="75" class="text">bank</text>
    <path d="M 400 90 Q 450 130 500 90" class="arrow" />
    <text x="450" y="125" class="text" font-size="12" fill="#64748b">吸收 "money" 特征</text>
    <rect x="470" y="160" width="60" height="30" class="box-active" fill="#fef08a" stroke="#eab308" />
    <text x="500" y="175" class="text">bank_v2</text>
    <line x1="500" y1="90" x2="500" y2="160" class="arrow" />
  </svg>
</div>

最终大模型输出的，是一个**融入了整个句子上下文语境的超级动态向量**。这正是 ChatGPT 等模型能够拥有极强语义理解能力的根基。

## 结语

本篇我们从零探索了词向量（Embedding）的原理，看到了数字是如何被赋予语义的。

从独热编码到 Word2Vec 的静态向量，再到 Transformer 的动态上下文向量，每一次演进，都是人类教导机器“像人一样理解世界”的巨大跨越。

但我们在本篇留了一个巨大的悬念：**Transformer 到底是如何通过 Self-Attention 机制，让词与词之间互相“吸收”特征的？**

这就是我们下一篇要手撕的核心内容：**《注意力机制解密：Self-Attention 的矩阵运算图解与 Q,K,V 的物理意义》**。
我们将彻底拆解大模型的心脏，用最直观的图解和矩阵运算，带你真正看懂 Q,K,V 到底在算什么。敬请期待！

---

## 📚 参考文献与延伸阅读

1. **Efficient Estimation of Word Representations in Vector Space** (Mikolov et al., 2013) - Word2Vec 的开山之作，提出了 CBOW 和 Skip-gram 模型。
2. **Distributed Representations of Words and Phrases and their Compositionality** (Mikolov et al., 2013) - 进一步优化了 Word2Vec，提出了负采样（Negative Sampling）等技术。
3. **Attention Is All You Need** (Vaswani et al., 2017) - Transformer 架构的奠基论文，彻底改变了 NLP 领域的向量表征方式。
4. **The Illustrated Word2vec** (Jay Alammar) - 极度推荐的可视化博客，用生动的图解详细解释了 Word2Vec 的工作原理。

---
> **下一篇预告：** [注意力机制解密：Self-Attention 的矩阵运算图解与 Q,K,V 的物理意义](#)
