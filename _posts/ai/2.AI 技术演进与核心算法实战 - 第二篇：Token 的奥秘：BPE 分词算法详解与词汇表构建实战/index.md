---
title: "AI 技术演进与核心算法实战 | 第二篇：Token 的奥秘：BPE 分词算法详解与词汇表构建实战"
excerpt: "从零开始理解 LLM 的第一步：Token 是什么？为什么不用字或词？深入剖析 BPE 算法原理，并手写一个极简分词器。"
description: "AI 技术演进与核心算法实战第二篇：Token 的奥秘：BPE 分词算法详解与词汇表构建实战"
keyword: "AI,大模型,Agent,Token,BPE,分词器,Tokenizer,NLP"
tag: "AI"
date: "2025-09-25 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战-第二篇：Token-的奥秘：BPE-分词算法详解与词汇表构建实战/cover/token-bpe.png"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战-第二篇：Token-的奥秘：BPE-分词算法详解与词汇表构建实战/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战-第二篇：Token-的奥秘：BPE-分词算法详解与词汇表构建实战/cover/token-bpe.png"
---

> 模型看到的不是诗与远方，而是一串串冰冷的数字。理解 Token，就是理解 AI 视角的语言世界。

在上一篇中，我们探讨了 AI 技术的范式转移，了解到如今的生成式大模型（如 ChatGPT）本质上是在玩一个极其复杂的“文字接龙”游戏（Next Token Prediction）。

但这里有一个关键问题：机器根本不懂什么是“字”，更不懂什么是“词”。计算机的世界里只有 0 和 1。那么，大模型究竟是如何将人类千变万化的语言转化为它可以计算的数字的呢？

这中间不可或缺的桥梁，就是**分词器（Tokenizer）**。而分词器产出的基本单位，就是 **Token**。

本篇是 **《AI 技术演进与核心算法实战》第一模块的第二篇**。我们将剥开 Token 的神秘外衣，深入剖析目前最主流的 **BPE（Byte Pair Encoding）算法**，并用 Python 手写一个极简的分词器，让你彻底掌握词汇表的构建实战。

---

## 1. 为什么我们需要 Token？

面对一段文本，我们首先要决定把它切分成多大的颗粒度，然后再映射成数字（ID）。在 NLP（自然语言处理）的发展史上，曾出现过三种主要的分词方案。

### 方案 A：按词切分（Word-level Tokenization）
这是最直觉的方案。把英文按空格切分，中文按词语切分。
*   **例子**：`"I love coding"` -> `["I", "love", "coding"]`
*   **致命缺陷**：
    1.  **词表爆炸**：语言中的词汇是无穷尽的，比如 `run`, `runs`, `running` 会被当作完全不同的三个词，导致词表（Vocabulary）极其庞大，极大增加模型的参数量。
    2.  **OOV（Out of Vocabulary）问题**：遇到网络新词或罕见词（如 `ChatGPT`），词表中没有，模型只能将其标记为 `<UNK>`（未知），从而丢失大量信息。

### 方案 B：按字符切分（Character-level Tokenization）
为了解决词表太大的问题，我们走向另一个极端：按单个字母或汉字切分。
*   **例子**：`"apple"` -> `["a", "p", "p", "l", "e"]`
*   **致命缺陷**：
    1.  **缺乏语义**：单个字母 `a` 或 `p` 本身没有任何实际含义，模型极难从中学习到语言的内在逻辑。
    2.  **序列过长**：一个短句会被切成几十个字符，这会让 Transformer 模型的计算量呈平方级暴增（因为注意力机制的复杂度是 $O(N^2)$），导致输入窗口极其受限。

### 方案 C：子词切分（Subword-level Tokenization）—— Token 的诞生
为了兼顾“语义保留”和“词表大小”，**子词切分**应运而生。它的核心理念是：**高频词直接保留，低频词拆分成更小的子词或字符**。
*   **例子**：`"unhappiness"` 拆分为 `["un", "happi", "ness"]`。
这样，即便遇到没见过的新词，模型也能通过组合已知的子词来理解它，彻底消灭了 OOV 问题，同时把词汇表控制在一个合理的大小（通常大模型的词表在 3万 到 12万 之间）。

这就是 Token 的本质：**它是模型处理文本的最佳颗粒度，是语言的“原子”。**

---

## 2. BPE 算法详解：从压缩到分词

目前主流大模型（如 GPT-4、Llama 3）都在使用基于 **BPE（Byte Pair Encoding，字节对编码）** 的分词算法。

BPE 最早诞生于 1994 年，原本是一种**数据压缩算法**。它的核心逻辑非常简单粗暴：**不断找到相邻出现频率最高的两个符号，把它们合并成一个新的符号。**

### BPE 算法的运行步骤

假设我们有如下一份极简的训练语料（单词和它的出现频率）：
*   `"l o w </w>"`：5次
*   `"l o w e r </w>"`：2次
*   `"n e w </w>"`：6次
*   `"w i d e s t </w>"`：3次

*(注：`</w>` 代表单词结束符，用来区分 `new` 这个词本身，和 `newly` 中的 `new` 子词)*

**第一步：初始化词表**
将所有单词拆解为单个字符，并统计字符对的频率。
此时词表包含基础字符：`l, o, w, e, r, n, i, d, s, t, </w>`

**第二步：寻找最高频的相邻字符对**
在上述语料中，我们可以统计出 `e` 和 `w` 总是连在一起出现（`new` 中 6 次，`lower` 中 2 次，共 8 次）。

**第三步：合并并更新词表**
将 `e` 和 `w` 合并为新 Token `ew`，加入词表。
此时语料更新为：
*   `"l o w </w>"` (5)
*   `"l o w ew r </w>"` (2)
*   `"n ew </w>"` (6)
*   `"w i d e s t </w>"` (3)

**第四步：循环迭代**
继续寻找最高频的组合。接下来发现 `new` (6次) 频率最高，合并 `n` 和 `ew` 为 `new`。再后来可能合并 `l` 和 `o` 为 `lo`，以此类推。

**第五步：终止**
当我们达到了预设的词表大小限制（Vocabulary Size），或者再也找不到能够合并的字符对时，训练结束。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 320" width="100%" height="100%" style="max-width: 620px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #3b82f6; stroke-width: 2; rx: 8; ry: 8; }
        .text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .title { font-weight: bold; font-size: 16px; fill: #0f172a; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrowhead); fill: none; }
        .hl { fill: #ea580c; font-weight: bold; }
      </style>
      <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
    <!-- Iteration 1 -->
    <rect x="20" y="20" width="160" height="280" class="box" />
    <text x="100" y="45" class="title">初始状态</text>
    <text x="100" y="80" class="text">l o w</text>
    <text x="100" y="110" class="text">l o w <tspan class="hl">e w</tspan> r</text>
    <text x="100" y="140" class="text">n <tspan class="hl">e w</tspan></text>
    <text x="100" y="170" class="text">w i d e s t</text>
    <text x="100" y="220" class="text" fill="#ef4444" font-weight="bold">最高频: e, w</text>
    <text x="100" y="250" class="text">合并为: ew</text>
    <path d="M 190 150 L 210 150" class="arrow" />
    <!-- Iteration 2 -->
    <rect x="230" y="20" width="160" height="280" class="box" />
    <text x="310" y="45" class="title">第 1 次合并后</text>
    <text x="310" y="80" class="text">l o w</text>
    <text x="310" y="110" class="text">l o w ew r</text>
    <text x="310" y="140" class="text"><tspan class="hl">n ew</tspan></text>
    <text x="310" y="170" class="text">w i d e s t</text>
    <text x="310" y="220" class="text" fill="#ef4444" font-weight="bold">最高频: n, ew</text>
    <text x="310" y="250" class="text">合并为: new</text>
    <path d="M 400 150 L 420 150" class="arrow" />
    <!-- Iteration 3 -->
    <rect x="440" y="20" width="160" height="280" class="box" />
    <text x="520" y="45" class="title">第 2 次合并后</text>
    <text x="520" y="80" class="text"><tspan class="hl">l o</tspan> w</text>
    <text x="520" y="110" class="text"><tspan class="hl">l o</tspan> w ew r</text>
    <text x="520" y="140" class="text">new</text>
    <text x="520" y="170" class="text">w i d e s t</text>
    <text x="520" y="220" class="text" fill="#ef4444" font-weight="bold">最高频: l, o</text>
    <text x="520" y="250" class="text">合并为: lo</text>
  </svg>
</div>

最终，训练语料中的高频词会被整体保留为一个 Token，而低频词或罕见拼写会被拆解成若干个子词 Token。

---

## 3. 代码实战：手写一个极简 BPE Tokenizer

纸上得来终觉浅。为了真正理解 BPE，我们来手写一个简化版的 BPE 分词器。它包含三个核心部分：**训练（Train）**、**编码（Encode）**、**解码（Decode）**。

### 3.1 训练（Train）与构建词表

我们要让分词器在一段语料上学习，找到最频繁的相邻对并合并。

```python
import re
from collections import defaultdict

class BasicBPETokenizer:
    def __init__(self):
        self.vocab = {}          # 词汇表：存储 id -> token 的映射
        self.merges = {}         # 合并规则：存储 (token1, token2) -> 新 token

    def get_stats(self, ids):
        """统计相邻 token 对的出现频率"""
        counts = defaultdict(int)
        for pair in zip(ids, ids[1:]):
            counts[pair] += 1
        return counts

    def merge(self, ids, pair, idx):
        """将列表中所有匹配到的 pair 合并为新的 idx"""
        new_ids = []
        i = 0
        while i < len(ids):
            if i < len(ids) - 1 and ids[i] == pair[0] and ids[i+1] == pair[1]:
                new_ids.append(idx)
                i += 2
            else:
                new_ids.append(ids[i])
                i += 1
        return new_ids

    def train(self, text, vocab_size):
        # 1. 初始阶段：将文本转化为基础字节（0-255）
        tokens = text.encode("utf-8")
        ids = list(tokens)
        
        # 初始化基础词表（0-255对应基础字节）
        self.vocab = {idx: bytes([idx]) for idx in range(256)}
        
        num_merges = vocab_size - 256
        
        # 2. 迭代合并
        for i in range(num_merges):
            stats = self.get_stats(ids)
            if not stats:
                break
            # 找到频率最高的相邻对
            best_pair = max(stats, key=stats.get)
            
            # 分配新的 ID
            new_idx = 256 + i
            
            # 更新 ID 列表
            ids = self.merge(ids, best_pair, new_idx)
            
            # 记录合并规则和更新词汇表
            self.merges[best_pair] = new_idx
            self.vocab[new_idx] = self.vocab[best_pair[0]] + self.vocab[best_pair[1]]
            
            print(f"合并 {best_pair} -> {new_idx} ({self.vocab[new_idx].decode('utf-8', errors='replace')})")
```

在这个实现中，我们直接使用了文本的 UTF-8 字节作为初始单位（这也是 GPT-2 和 GPT-4 的实际做法，即 Byte-level BPE），这样能完美支持所有语言及特殊字符，彻底消灭 OOV。

### 3.2 编码（Encode）

编码阶段就是将一段人类输入的字符串，根据我们刚才训练好的合并规则（`merges`），转化为大模型能看懂的整数 ID 列表。

```python
    def encode(self, text):
        """文本 -> Token IDs"""
        tokens = list(text.encode("utf-8"))
        
        while len(tokens) >= 2:
            stats = self.get_stats(tokens)
            # 找到在我们的 merges 规则中最先被合并的 pair
            # (因为较早合并的 pair 代表频率更高，优先级更大)
            pair = min(stats.keys(), key=lambda p: self.merges.get(p, float("inf")))
            
            if pair not in self.merges:
                break # 没有任何可合并的对了，退出循环
                
            idx = self.merges[pair]
            tokens = self.merge(tokens, pair, idx)
            
        return tokens
```

### 3.3 解码（Decode）

解码阶段相对简单，直接查字典把 ID 映射回字节流，再转化为字符串。大模型生成完一堆 ID 后，就是通过这个步骤呈现给我们的。

```python
    def decode(self, ids):
        """Token IDs -> 文本"""
        tokens = b"".join(self.vocab[idx] for idx in ids)
        text = tokens.decode("utf-8", errors="replace")
        return text
```

### 测试我们手写的分词器

```python
# 测试用例
text_data = "hello world, hello python, hello AI!"

tokenizer = BasicBPETokenizer()
# 训练：假设我们要将词表大小从基础的 256 扩充到 270（执行 14 次合并）
tokenizer.train(text_data, vocab_size=270)

print("\n--- 测试 Encode 和 Decode ---")
test_str = "hello AI!"
ids = tokenizer.encode(test_str)
print(f"原始文本: '{test_str}'")
print(f"编码后的 IDs: {ids}")
print(f"解码还原: '{tokenizer.decode(ids)}'")
```

*通过这几十行代码，你其实已经写出了 OpenAI 的 `tiktoken` 库最核心的底层逻辑。*

---

## 4. 大模型词汇表的那些“坑”

深入理解了 Token 和 BPE 后，很多平时用大模型时遇到的诡异现象就迎刃而解了。

### 现象 1：为什么大模型总是不擅长算术？
你让大模型算 `12345 + 67890`，它可能会出错。
**原因**：因为 BPE 是基于频率合并的。`123` 可能是高频词作为一个 Token，而 `45` 是另一个 Token。但在另一组数字里，切分方式可能变成了 `12` 和 `345`。大模型看到的根本不是连续的数字，而是被任意切碎的片段，它很难理解对齐和进位的数学规则。
*(注：Llama 3 等最新模型已经开始强制将数字按单字符切分，以提升数学能力。)*

### 现象 2：为什么大模型在玩“数单词里有几个字母 r”时会失败？
经典问题：“`strawberry` 里面有几个 r？” 早期模型经常回答 2 个。
**原因**：在 GPT 的词表中，`strawberry` 是一个完整的 Token。模型直接把这个 Token 当作一个整体概念（比如 ID 4213），它根本不知道这个词的内部由哪些字母组成。对模型来说，这就好比你问它“苹果里面有几个核”，如果不专门训练，它是“看”不到内部结构的。

### 现象 3：为什么中文 Token 消耗得特别快？
**原因**：很多国外的大模型（如早期 Llama）训练语料主要为英文。在 BPE 训练阶段，英文的高频词被合并成了很长的 Token，而中文语料少，未能充分合并。这导致一个英文单词可能只需 1 个 Token，而一个汉字由于需要用 3 个 UTF-8 字节表示，经常被拆解成 2-3 个 Token。这不仅让推理成本翻倍，还挤占了上下文窗口。

---

## 结语

> “语言的边界，就是我世界的边界。” —— 维特根斯坦

分词器是连接人类语言和 AI 数学世界的翻译官。通过 BPE 算法，我们将无穷无尽的文本世界，坍缩成了一本包含几万个 Token 的精简词典。这不仅解决了 OOV 问题，更在“保留语义”与“控制计算复杂度”之间找到了完美的平衡。

现在，大模型已经把人类语言转换成了整齐划一的整数序列（Token IDs）。但整数本身只是一个序号，缺乏数学上的连续性与相对关系（比如 ID 为 1 的 "猫" 和 ID 为 2 的 "狗"，在语义上显然比 ID 为 1000 的 "石头" 更接近，但单纯的数字 ID 无法体现这一点）。

要解决这个问题，我们需要引入一个极其惊艳的数学魔法 —— **Embedding（词嵌入）**。

下一篇，我们将深入高维的向量空间，探讨大模型是如何真正理解词与词之间“意思”的。敬请期待《向量的语义世界：Embedding 原理、Word2Vec 到 Transformer 的向量空间演化》。

---

## 📚 参考文献与延伸阅读

1. **Neural Machine Translation of Rare Words with Subword Units** (Sennrich et al., 2015) - 首次将 BPE 算法引入 NLP 领域，解决了机器翻译中的稀有词问题。
2. **Tiktoken** (OpenAI) - OpenAI 官方开源的高性能 BPE 分词器库，支持 GPT-3.5/GPT-4 系列模型。
3. **Let's build the GPT Tokenizer** (Andrej Karpathy) - 前 Tesla AI 总监 Karpathy 录制的长达 2 小时的 Tokenizer 教学视频，非常硬核推荐。

---
> **下一篇预告：** [向量的语义世界：Embedding 原理、Word2Vec 到 Transformer 的向量空间演化](#)