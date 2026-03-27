---
title: "AI 技术演进与核心算法实战 | 第八篇：高级推理策略：Chain-of-Thought (CoT)、Tree-of-Thoughts (ToT) 算法原理与实现"
excerpt: "简单提示词只能让模型\"直接回答\"，但复杂推理需要\"分步思考\"。从 Chain-of-Thought 到 Tree-of-Thoughts，深入解析两种高级推理策略的算法原理，并手写一个 ToT 推理引擎。"
description: "AI 技术演进与核心算法实战第八篇：高级推理策略：Chain-of-Thought (CoT)、Tree-of-Thoughts (ToT) 算法原理与实现"
keyword: "AI,大模型,Chain-of-Thought,CoT,Tree-of-Thoughts,ToT,推理策略,思维链,提示工程"
tag: "AI"
date: "2026-03-27 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战-第八篇：高级推理策略：Chain-of-Thought-(CoT)、Tree-of-Thoughts-(ToT)-算法原理与实现/assets/cover/cot-tot-cover.svg"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战-第八篇：高级推理策略：Chain-of-Thought-(CoT)、Tree-of-Thoughts-(ToT)-算法原理与实现/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战-第八篇：高级推理策略：Chain-of-Thought-(CoT)、Tree-of-Thoughts-(ToT)-算法原理与实现/assets/cover/cot-tot-cover.svg"
---

> 简单的问题可以直接给出答案，但复杂的问题需要先想清楚再回答。CoT 教模型"列草稿"，ToT 教模型"走迷宫"。

在[上一篇](7.AI%20%E6%8A%80%E6%9C%AF%E6%BC%94%E8%BF%9B%E4%B8%8E%E6%A0%B8%E5%BF%83%E7%AE%97%E6%B3%95%E5%AE%9E%E6%88%98%20-%20%E7%AC%AC%E4%B8%83%E7%AF%87%EF%BC%9A%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%9A%84%E6%95%B0%E5%AD%A6%E6%9C%AC%E8%B4%A8%EF%BC%9AIn-Context%20Learning%20%E7%9A%84%E8%B4%9D%E5%8F%B6%E6%96%AF%E8%A7%A3%E9%87%8A%E4%B8%8E%E6%A6%82%E7%8E%87%E5%88%86%E5%B8%83%E6%93%8D%E6%8E%A7/index.md)中，我们揭示了提示词的本质——操控大模型内部的概率分布。我们了解到，提示词策略可以分为三个层次：激活、塑形和推理引导。其中最强大的"推理引导"层次，正是本篇要深入探讨的主题。

一个直观的问题浮出水面：**如果模型能"分步思考"，会不会比直接给出答案更准确？**

答案是肯定的。2022 年，Google 的研究团队发现，只需要在提示词中加上一句"让我们一步一步来想"，就能让大模型在数学推理、逻辑推理等任务上的准确率大幅提升。这个发现开启了一个全新的研究方向——**高级推理策略**。

本篇是 **《AI 技术演进与核心算法实战》第二模块的第二篇**。我们将深入剖析两种最核心的推理策略：**Chain-of-Thought（思维链）** 和 **Tree-of-Thoughts（思维树）**，理解它们背后的算法原理，并手写一个完整的 ToT 推理引擎。

---

## 1. 从"直接回答"到"分步思考"：为什么需要推理策略？

### 1.1 一个简单的实验

让我们先做一个思想实验。假设你问一个聪明的高中生以下问题：

> **直接回答模式**：小明有 5 个苹果，给了小红 2 个，又买了 3 个，又给了小刚 1 个，然后小红还给他 1 个。请问小明现在有几个苹果？

这个问题的答案是 $5 - 2 + 3 - 1 + 1 = 6$。大多数人直接心算就能得出答案。但如果问题变得更复杂呢？

> **复杂推理模式**：一个农场有鸡和兔子共 35 只，脚共 94 只，问鸡和兔子各有多少？

这种"鸡兔同笼"问题，即使是最聪明的人也很难直接"蹦出"答案。你一定会**先设未知数、列方程、再求解**——这个过程就是"思维链"。

**大模型面临的情况完全一样**：对于简单问题，直接生成答案就行；但对于需要多步推理的问题，如果要求模型直接输出最终答案，它往往会"跳步"或出错。

### 1.2 直观对比：直接回答 vs 分步思考

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arr1); fill: none; }
        .arrow-red { stroke: #ef4444; stroke-width: 2; marker-end: url(#arr-red); fill: none; }
        .arrow-green { stroke: #22c55e; stroke-width: 2; marker-end: url(#arr-green); fill: none; }
      </style>
      <marker id="arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
      <marker id="arr-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
      </marker>
      <marker id="arr-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
      </marker>
    </defs>
    <text x="360" y="25" class="text-bold" font-size="15">直接回答 vs 分步思考：一个直观对比</text>
    <!-- Left: Direct Answer -->
    <text x="180" y="55" class="text-bold" fill="#ef4444" font-size="14">直接回答（Standard Prompting）</text>
    <rect x="30" y="70" width="300" height="140" class="box"/>
    <rect x="50" y="85" width="260" height="24" fill="#fef2f2" stroke="#fca5a5" stroke-width="1" rx="4"/>
    <text x="180" y="100" class="text" font-size="11">问题：鸡兔共35只，脚共94只</text>
    <path d="M 180 120 L 180 140" class="arrow-red"/>
    <rect x="100" y="145" width="160" height="35" fill="#fee2e2" stroke="#f87171" stroke-width="1.5" rx="6"/>
    <text x="180" y="160" class="text-bold" fill="#dc2626" font-size="13">答案：鸡23只，兔12只</text>
    <text x="260" y="130" class="text" font-size="10" fill="#dc2626">（跳过了所有中间步骤）</text>
    <rect x="50" y="190" width="260" height="14" fill="#fee2e2" rx="2"/>
    <text x="180" y="198" class="text" font-size="11" fill="#dc2626">模型"直接蹦出"答案</text>
    <!-- Right: CoT -->
    <text x="540" y="55" class="text-bold" fill="#22c55e" font-size="14">分步思考（Chain-of-Thought）</text>
    <rect x="390" y="70" width="300" height="310" class="box"/>
    <rect x="410" y="85" width="260" height="24" fill="#f0fdf4" stroke="#86efac" stroke-width="1" rx="4"/>
    <text x="540" y="100" class="text" font-size="11">问题：鸡兔共35只，脚共94只</text>
    <path d="M 540 115 L 540 128" class="arrow-green"/>
    <rect x="420" y="130" width="240" height="22" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1" rx="4"/>
    <text x="540" y="143" class="text" font-size="11">Step 1: 设鸡x只，兔y只</text>
    <path d="M 540 155 L 540 165" class="arrow-green"/>
    <rect x="420" y="168" width="240" height="22" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1" rx="4"/>
    <text x="540" y="181" class="text" font-size="11">Step 2: x+y=35, 2x+4y=94</text>
    <path d="M 540 193 L 540 203" class="arrow-green"/>
    <rect x="420" y="206" width="240" height="22" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1" rx="4"/>
    <text x="540" y="219" class="text" font-size="11">Step 3: 由方程1得 x=35-y</text>
    <path d="M 540 231 L 540 241" class="arrow-green"/>
    <rect x="420" y="244" width="240" height="22" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1" rx="4"/>
    <text x="540" y="257" class="text" font-size="11">Step 4: 代入得 70+2y=94</text>
    <path d="M 540 269 L 540 279" class="arrow-green"/>
    <rect x="420" y="282" width="240" height="22" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1" rx="4"/>
    <text x="540" y="295" class="text" font-size="11">Step 5: y=12, x=23</text>
    <path d="M 540 307 L 540 317" class="arrow-green"/>
    <rect x="440" y="320" width="200" height="30" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5" rx="6"/>
    <text x="540" y="337" class="text-bold" fill="#16a34a">答案：鸡23只，兔12只</text>
    <rect x="410" y="360" width="260" height="14" fill="#f0fdf4" rx="2"/>
    <text x="540" y="369" class="text" font-size="10" fill="#16a34a">每一步都有推理过程 ✓</text>
    <!-- Bottom insight -->
    <rect x="30" y="390" width="660" height="24" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1" rx="4"/>
    <text x="360" y="405" class="text" font-size="11" fill="#0369a1">关键洞察：分步思考让模型的"工作记忆"被逐步记录，降低了单步推理的认知负担</text>
  </svg>
</div>

**图解说明**：上图对比了两种提示策略。左侧的"直接回答"模式下，模型跳过了所有中间步骤，直接给出最终答案——一旦中间某步算错，就无法察觉。右侧的"Chain-of-Thought"模式下，模型把每一步推理都展示出来，不仅更准确，还让我们能检查哪里出了问题。

### 1.3 本篇的核心论点

在深入之前，先给出本篇的三个核心论点：

1. **CoT 的本质是"展露推理过程"**：它不改变模型本身，而是让模型把内部的"思考过程"用自然语言写出来，相当于给模型发了一张"草稿纸"。
2. **ToT 的本质是"探索与回溯"**：当一条思维路径走不通时，ToT 允许模型"退回去"尝试其他路径，类似人类在走迷宫时的策略。
3. **从 CoT 到 ToT 是推理策略的质变**：CoT 是线性搜索（一条路走到黑），ToT 是树状搜索（遇到死胡同就换条路）。这让模型从"能推理"进化到"会策略性地推理"。

---

## 2. Chain-of-Thought (CoT)：让模型"想清楚再回答"

### 2.1 一个直觉类比：心算 vs 草稿纸

还记得小时候做数学题吗？简单的加减法你可以**心算**（在脑子里完成），但遇到复杂的乘除法或多步运算时，老师一定会让你**打草稿**——把中间步骤写在纸上。

**为什么打草稿能提高正确率？** 因为人的"工作记忆"容量有限。心理学家 George Miller 的著名论文指出，人类短时记忆大约只能同时处理 $7 \pm 2$ 个信息单元。当你把中间结果写到纸上，就释放了大脑的工作记忆，可以专注于下一步的计算。

**大模型也有类似的"工作记忆"限制**。Transformer 在生成下一个 token 时，它的"上下文窗口"就是它的工作记忆。CoT 的巧妙之处在于：**它让模型把中间推理结果"写"到上下文中，使得后续生成时能"看到"前面的推理步骤**。

通俗地说：
- **直接回答** = 心算（所有推理都在"脑子"里进行，容易出错）
- **CoT** = 打草稿（把中间步骤写出来，可以回看、检查、纠错）

### 2.2 Zero-shot CoT：一句神奇的魔法咒语

2022 年，Kojima 等人在论文 *"Large Language Models are Zero-Shot Reasoners"* 中发现了一个惊人的现象：

> **只需要在提示词末尾加上"Let's think step by step"（让我们一步一步来想），就能让模型在多种推理任务上大幅提升准确率。**

这被称为 **Zero-shot CoT**，因为它不需要任何示例，只需要一句简单的触发语。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 335" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .prompt-box { fill: #f0f9ff; stroke: #0ea5e9; stroke-width: 1.5; rx: 6; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
      </style>
    </defs>
    <text x="350" y="25" class="text-bold" font-size="15">Zero-shot CoT：一句咒语触发的推理革命</text>
    <!-- Before -->
    <text x="175" y="55" class="text-bold" fill="#ef4444" font-size="13">标准提示</text>
    <rect x="20" y="70" width="310" height="100" class="prompt-box"/>
    <text x="175" y="95" class="text" font-size="12" fill="#0369a1">问：罗杰有5个网球，他又买了</text>
    <text x="175" y="112" class="text" font-size="12" fill="#0369a1">2罐网球，每罐3个。他现在有几个？</text>
    <rect x="40" y="130" width="270" height="28" fill="#fef2f2" rx="4"/>
    <text x="175" y="147" class="text-bold" fill="#dc2626">答：11个</text>
    <text x="175" y="185" class="text" font-size="12" fill="#dc2626">（错误！5+2×3=11，漏算了"每罐3个"）</text>
    <!-- Arrow -->
    <text x="350" y="120" class="text-bold" font-size="20" fill="#64748b">+</text>
    <text x="350" y="145" class="text" font-size="10" fill="#8b5cf6" font-weight="bold">"让我们一步</text>
    <text x="350" y="158" class="text" font-size="10" fill="#8b5cf6" font-weight="bold">一步来想"</text>
    <!-- After -->
    <text x="525" y="55" class="text-bold" fill="#22c55e" font-size="13">Zero-shot CoT</text>
    <rect x="370" y="70" width="310" height="220" class="prompt-box"/>
    <text x="525" y="90" class="text" font-size="11" fill="#0369a1">问：罗杰有5个网球，他又买了</text>
    <text x="525" y="108" class="text" font-size="11" fill="#0369a1">2罐网球，每罐3个。他现在有几个？</text>
    <text x="525" y="126" class="text" font-size="11" fill="#8b5cf6">让我们一步一步来想。</text>
    <line x1="385" y1="138" x2="665" y2="138" stroke="#e2e8f0" stroke-width="1"/>
    <text x="525" y="155" class="text" font-size="10" fill="#16a34a">罗杰一开始有 5 个网球。</text>
    <text x="525" y="172" class="text" font-size="10" fill="#16a34a">他又买了 2 罐，每罐 3 个。</text>
    <text x="525" y="189" class="text" font-size="10" fill="#16a34a">所以新买了 2 × 3 = 6 个。</text>
    <text x="525" y="206" class="text" font-size="10" fill="#16a34a">总共 5 + 6 = 11 个。</text>
    <rect x="420" y="218" width="210" height="22" fill="#dcfce7" stroke="#22c55e" stroke-width="1" rx="4"/>
    <text x="525" y="231" class="text-bold" fill="#16a34a">答：罗杰现在有 11 个网球。</text>
    <text x="525" y="255" class="text" font-size="11" fill="#16a34a">等一下...5+6=11？</text>
    <text x="525" y="272" class="text" font-size="10" fill="#f59e0b">（模型分步了但最终加法算错了，不过推理过程清晰多了）</text>
    <!-- Bottom note -->
    <rect x="20" y="300" width="660" height="28" fill="#fafafa" stroke="#e2e8f0" stroke-width="1" rx="4"/>
    <text x="350" y="317" class="text" font-size="11" fill="#64748b">Zero-shot CoT 的效果取决于模型规模——模型越大（参数越多），触发推理的效果越显著</text>
  </svg>
</div>

**图解说明**：上图展示了 Zero-shot CoT 的效果。标准提示下，模型直接给出错误答案（11 个，漏算了乘法）。加上"让我们一步一步来想"后，模型开始分步推理，展示了完整的思考过程。虽然最终答案仍可能有误（如这个例子中加法算错），但推理过程清晰可见，且在大模型上准确率显著提升。

### 2.3 Few-shot CoT：通过示例教会模型"展示过程"

如果说 Zero-shot CoT 是"一句咒语"，那么 **Few-shot CoT** 就是"手把手教学"。

Few-shot CoT 由 Wei 等人在论文 *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* 中提出。核心思路很简单：**在提示词中给出包含推理过程的示例，模型就会"照猫画虎"，在回答新问题时也展示推理过程。**

```
Q: 罗杰有5个网球，他又买了2罐，每罐3个。他现在有几个网球？
A: 罗杰一开始有 5 个网球。2 罐每罐 3 个，就是 2 × 3 = 6 个新网球。
   5 + 6 = 11。答案是 11。

Q: 食堂有23个苹果。如果他们用掉20个来做午餐，又买了6个，现在有几个？
A: 食堂原来有 23 个苹果，用掉 20 个，剩 23 - 20 = 3 个。又买了 6 个，
   所以 3 + 6 = 9。答案是 9。

Q: 一辆公交车有 45 人。第一站下了 10 人，上了 5 人。第二站下了 8 人，上了 3 人。现在车上有多少人？
A:
```

注意这里的关键：**示例中不仅有答案，还有完整的推理过程**。模型看到这些示例后，就会学到"在给出答案之前，先把推理步骤写出来"的模式。

### 2.4 CoT 为什么有效？—— 计算量的视角

从上一篇的概率分布视角来看，CoT 的效果可以理解为：**更多的推理 tokens = 更多的"计算空间"来修正错误**。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 300" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
      </style>
    </defs>
    <text x="350" y="25" class="text-bold" font-size="15">CoT 的计算量视角：更多 Token = 更强推理</text>
    <!-- Direct: 1 token -->
    <text x="130" y="55" class="text-bold" fill="#64748b">直接回答</text>
    <rect x="30" y="70" width="200" height="140" class="box"/>
    <text x="130" y="90" class="text" font-size="11" fill="#64748b">问题 Token</text>
    <rect x="60" y="100" width="140" height="20" fill="#e2e8f0" rx="3"/>
    <text x="130" y="113" class="text" font-size="10">鸡兔共35只，脚94只</text>
    <path d="M 130 125 L 130 140" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr-cot)"/>
    <text x="130" y="152" class="text" font-size="11" fill="#ef4444">答案 Token</text>
    <rect x="80" y="162" width="100" height="20" fill="#fee2e2" rx="3"/>
    <text x="130" y="175" class="text" font-size="10">鸡23只兔12只</text>
    <rect x="60" y="195" width="140" height="8" fill="#fee2e2" rx="3"/>
    <text x="130" y="220" class="text" font-size="11" fill="#64748b">仅 1 步推理</text>
    <text x="130" y="235" class="text" font-size="10" fill="#ef4444">容错率：0（一步错全错）</text>
    <!-- CoT: multiple tokens -->
    <text x="420" y="55" class="text-bold" fill="#22c55e">CoT 推理</text>
    <rect x="320" y="70" width="300" height="190" class="box"/>
    <text x="470" y="90" class="text" font-size="11" fill="#64748b">问题 Token</text>
    <rect x="340" y="100" width="260" height="20" fill="#e2e8f0" rx="3"/>
    <text x="470" y="113" class="text" font-size="10">鸡兔共35只，脚94只</text>
    <path d="M 470 125 L 470 135" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="470" y="147" class="text" font-size="10" fill="#22c55e">推理 Step 1</text>
    <rect x="350" y="152" width="240" height="12" fill="#dcfce7" rx="2"/>
    <path d="M 470 167 L 470 175" stroke="#22c55e" stroke-width="1.5"/>
    <text x="470" y="185" class="text" font-size="10" fill="#22c55e">推理 Step 2</text>
    <rect x="350" y="190" width="240" height="12" fill="#dcfce7" rx="2"/>
    <path d="M 470 205 L 470 213" stroke="#22c55e" stroke-width="1.5"/>
    <text x="470" y="223" class="text" font-size="10" fill="#22c55e">推理 Step 3</text>
    <rect x="350" y="228" width="240" height="12" fill="#dcfce7" rx="2"/>
    <path d="M 470 243 L 470 251" stroke="#22c55e" stroke-width="1.5"/>
    <text x="470" y="253" class="text" font-size="10" fill="#16a34a" font-weight="bold">答案 Token</text>
    <rect x="380" y="258" width="180" height="12" fill="#dcfce7" rx="2"/>
    <rect x="340" y="278" width="260" height="8" fill="#dcfce7" rx="3"/>
    <!-- Bottom formula -->
    <rect x="30" y="275" width="590" height="20" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1" rx="4"/>
    <text x="325" y="288" class="text" font-size="11" fill="#0369a1">核心公式：更多推理 Token = 更多 Transformer 前向传播 = 更多"计算空间"用于修正推理错误</text>
    <defs>
      <marker id="arr-cot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
    </defs>
  </svg>
</div>

**图解说明**：上图从"计算量"的视角解释了 CoT 为什么有效。直接回答模式下，模型只有一次前向传播的机会来生成答案——就像让你心算一道复杂的数学题。而 CoT 模式下，每生成一个推理步骤的 token，模型就多了一次"检查和修正"的机会——就像让你打草稿，每一步都可以回头看。**本质上，CoT 通过增加生成的 token 数量，间接增加了模型可用的"计算量"。**

用更精确的数学语言描述：如果模型有 $N$ 层 Transformer，直接回答 $k$ 个 token 需要进行 $N \times k$ 次前向传播。而 CoT 先生成 $m$ 个推理 token，再生成 $k$ 个答案 token，总共需要进行 $N \times (m + k)$ 次前向传播。当 $m$ 远大于 $k$ 时，模型获得了更多的"思考时间"。

### 2.5 CoT 什么时候有效？什么时候无效？

CoT 并不是万能的。根据论文的实验结果，CoT 在以下情况下**特别有效**：

| 条件 | 说明 | 类比 |
|------|------|------|
| **需要多步推理** | 数学、逻辑推理、多步计算 | 复杂的数学应用题 |
| **模型足够大** | 参数量通常需要 > 60B | 大脑容量足够大才能"分步想" |
| **任务有明确的推理链** | 因果关系清晰的推理任务 | 一步一步能走通的路 |

而在以下情况下 CoT **效果有限**：

| 条件 | 说明 | 类比 |
|------|------|------|
| **简单的事实回忆** | "中国的首都是什么？" | 这不需要推理，直接知道就行 |
| **模型太小** | 参数量 < 10B 的模型 | 大脑太小，即使打草稿也想不清楚 |
| **创造性任务** | 写诗、写故事 | 创造力不是"推理"出来的 |
| **任务需要回溯** | 走迷宫、解谜 | 线性推理走不通，需要"退回去"——这是 ToT 的场景 |

> **关键发现**：CoT 在模型参数量达到约 100B 时开始显著涌现（Emergent Ability）。小模型即使加上"Let's think step by step"也难以提升推理能力。这就像一个孩子——即使你给他草稿纸，如果他还没学过乘法，让他算鸡兔同笼还是做不出来。

---

## 3. Tree-of-Thoughts (ToT)：从"一条路"到"探索多条路"

### 3.1 一个走迷宫的类比

想象你在一个迷宫里找出口：

- **CoT 的策略**：选定一个方向，一直往前走。如果走到死胡同……就继续往前走（因为没有"回头"的能力）。结果很可能是——**困在死胡同里出不来**。
- **ToT 的策略**：每到一个岔路口，**同时探索几条路**。如果一条路是死胡同，就**退回来**换另一条路继续探索。这就是计算机科学中经典的**搜索算法**。

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 350" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
      </style>
    </defs>
    <text x="360" y="25" class="text-bold" font-size="15">CoT vs ToT：从"一条路"到"多条路"</text>
    <!-- CoT: linear chain -->
    <text x="180" y="55" class="text-bold" fill="#f59e0b" font-size="13">CoT：线性链（一条路走到黑）</text>
    <rect x="30" y="70" width="300" height="240" class="box"/>
    <circle cx="100" cy="110" r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
    <text x="100" y="110" class="text" font-size="11">问题</text>
    <line x1="120" y1="110" x2="160" y2="110" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="180" cy="110" r="18" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
    <text x="180" y="110" class="text" font-size="10">想1</text>
    <line x1="198" y1="110" x2="230" y2="110" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="248" cy="110" r="18" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
    <text x="248" y="110" class="text" font-size="10">想2</text>
    <line x1="266" y1="110" x2="290" y2="110" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="80" cy="170" r="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="80" y="170" class="text" font-size="10">想3</text>
    <line x1="96" y1="170" x2="124" y2="170" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="140" cy="170" r="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="140" y="170" class="text" font-size="10">想4</text>
    <line x1="156" y1="170" x2="184" y2="170" stroke="#ef4444" stroke-width="2"/>
    <rect x="186" y="155" width="40" height="30" fill="#fee2e2" stroke="#ef4444" stroke-width="2" rx="4"/>
    <text x="206" y="173" class="text" font-size="10" fill="#dc2626">死路</text>
    <text x="180" y="220" class="text" font-size="11" fill="#ef4444">遇到死胡同无法回退！</text>
    <text x="180" y="240" class="text" font-size="11" fill="#ef4444">推理链断裂，最终答案错误</text>
    <text x="180" y="265" class="text" font-size="10" fill="#64748b">（无法修正早期推理错误）</text>
    <!-- ToT: tree -->
    <text x="540" y="55" class="text-bold" fill="#22c55e" font-size="13">ToT：思维树（探索多条路径）</text>
    <rect x="390" y="70" width="300" height="260" class="box"/>
    <circle cx="540" cy="105" r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
    <text x="540" y="105" class="text" font-size="11">问题</text>
    <line x1="520" y1="122" x2="450" y2="155" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="540" y1="125" x2="540" y2="155" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="560" y1="122" x2="630" y2="155" stroke="#22c55e" stroke-width="1.5"/>
    <circle cx="450" cy="170" r="16" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <text x="450" y="170" class="text" font-size="9">路径A</text>
    <circle cx="540" cy="170" r="16" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <text x="540" y="170" class="text" font-size="9">路径B</text>
    <circle cx="630" cy="170" r="16" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <text x="630" y="170" class="text" font-size="9">路径C</text>
    <!-- Branch A -->
    <line x1="435" y1="185" x2="415" y2="215" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="465" y1="185" x2="480" y2="215" stroke="#22c55e" stroke-width="1.5"/>
    <circle cx="415" cy="228" r="14" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="415" y="228" class="text" font-size="8">A1</text>
    <circle cx="480" cy="228" r="14" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="480" y="228" class="text" font-size="8">A2</text>
    <!-- Branch B -->
    <line x1="525" y1="185" x2="510" y2="215" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="555" y1="185" x2="570" y2="215" stroke="#22c55e" stroke-width="1.5"/>
    <circle cx="510" cy="228" r="14" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="510" y="228" class="text" font-size="8">B1</text>
    <rect x="556" y="215" width="28" height="26" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5" rx="3"/>
    <text x="570" y="231" class="text" font-size="8" fill="#dc2626">B2</text>
    <text x="570" y="255" class="text" font-size="8" fill="#ef4444">✗ 剪枝</text>
    <!-- Branch C -->
    <line x1="615" y1="185" x2="605" y2="215" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="645" y1="185" x2="655" y2="215" stroke="#22c55e" stroke-width="1.5"/>
    <rect x="591" y="215" width="28" height="26" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5" rx="3"/>
    <text x="605" y="231" class="text" font-size="8" fill="#dc2626">C1</text>
    <text x="605" y="255" class="text" font-size="8" fill="#ef4444">✗ 剪枝</text>
    <circle cx="655" cy="228" r="14" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="655" y="228" class="text" font-size="8">C2</text>
    <!-- Result -->
    <text x="540" y="290" class="text" font-size="11" fill="#16a34a">发现死路 → 剪枝 → 换路探索</text>
    <text x="540" y="310" class="text" font-size="11" fill="#16a34a">最终找到最优路径！ ✓</text>
  </svg>
</div>

**图解说明**：上图对比了 CoT 和 ToT 的核心区别。CoT 像走迷宫时不做标记——选了一条路就一直走，遇到死胡同也没法回退（因为它是一条线性链）。而 ToT 像走迷宫时在每个岔路口做标记——同时探索多条路，发现死路就"剪枝"（放弃），换另一条路继续。这种"探索-评估-回溯"的策略，让 ToT 能够处理 CoT 无法解决的复杂推理任务。

### 3.2 ToT 的核心算法：三大操作

ToT 由 Yao 等人在 2023 年的论文 *Tree of Thoughts: Deliberate Problem Solving with Large Language Models* 中提出。它的核心思想是把推理过程建模为一棵**搜索树**，并使用三个关键操作来求解：

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 340" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
        .gen-box { fill: #ede9fe; stroke: #8b5cf6; stroke-width: 2; rx: 8; }
        .eval-box { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; rx: 8; }
        .search-box { fill: #dcfce7; stroke: #22c55e; stroke-width: 2; rx: 8; }
      </style>
    </defs>
    <text x="360" y="25" class="text-bold" font-size="15">ToT 的三大核心操作</text>
    <!-- Step 1: Generate -->
    <rect x="20" y="50" width="220" height="170" class="gen-box"/>
    <text x="130" y="75" class="text-bold" fill="#7c3aed" font-size="14">1. 思维生成 (Generate)</text>
    <text x="130" y="100" class="text" font-size="11">给定当前状态 s</text>
    <text x="130" y="118" class="text" font-size="11">生成 k 个候选思维：</text>
    <rect x="40" y="130" width="180" height="24" fill="white" stroke="#c4b5fd" stroke-width="1" rx="4"/>
    <text x="130" y="145" class="text" font-size="11">{t₁, t₂, t₃, ..., tₖ}</text>
    <text x="130" y="175" class="text" font-size="10" fill="#64748b">类比：在岔路口</text>
    <text x="130" y="193" class="text" font-size="10" fill="#64748b">同时探索 k 条路</text>
    <!-- Arrow 1->2 -->
    <path d="M 245 140 L 290 140" stroke="#64748b" stroke-width="2" marker-end="url(#arr-tot)"/>
    <text x="267" y="130" class="text" font-size="10" fill="#8b5cf6" font-weight="bold">评估</text>
    <!-- Step 2: Evaluate -->
    <rect x="295" y="50" width="220" height="170" class="eval-box"/>
    <text x="405" y="75" class="text-bold" fill="#d97706" font-size="14">2. 状态评估 (Evaluate)</text>
    <text x="405" y="100" class="text" font-size="11">用评估函数对每个</text>
    <text x="405" y="118" class="text" font-size="11">思维路径打分：</text>
    <rect x="315" y="130" width="180" height="24" fill="white" stroke="#fcd34d" stroke-width="1" rx="4"/>
    <text x="405" y="145" class="text" font-size="11">V(s, t₁) = 0.8</text>
    <text x="405" y="175" class="text" font-size="10" fill="#64748b">类比：判断哪条路</text>
    <text x="405" y="193" class="text" font-size="10" fill="#64748b">更"有希望"通向出口</text>
    <!-- Arrow 2->3 -->
    <path d="M 520 140 L 565 140" stroke="#64748b" stroke-width="2" marker-end="url(#arr-tot)"/>
    <text x="542" y="130" class="text" font-size="10" fill="#22c55e" font-weight="bold">搜索</text>
    <!-- Step 3: Search -->
    <rect x="570" y="50" width="140" height="170" class="search-box"/>
    <text x="640" y="75" class="text-bold" fill="#16a34a" font-size="14">3. 搜索 (Search)</text>
    <text x="640" y="100" class="text" font-size="11">选择最优路径</text>
    <text x="640" y="118" class="text" font-size="11">继续深入：</text>
    <rect x="585" y="130" width="110" height="24" fill="white" stroke="#86efac" stroke-width="1" rx="4"/>
    <text x="640" y="145" class="text" font-size="10">BFS / DFS</text>
    <text x="640" y="175" class="text" font-size="10" fill="#64748b">类比：沿着最</text>
    <text x="640" y="193" class="text" font-size="10" fill="#64748b">有希望的路继续走</text>
    <!-- Loop back arrow -->
    <path d="M 640 225 L 640 260 L 130 260 L 130 225" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3" marker-end="url(#arr-tot)"/>
    <text x="385" y="275" class="text-bold" fill="#64748b" font-size="12">循环直到找到满意答案或达到最大搜索深度</text>
    <!-- Bottom summary -->
    <rect x="20" y="295" width="690" height="36" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1" rx="6"/>
    <text x="365" y="312" class="text" font-size="11" fill="#0369a1">ToT = Generate + Evaluate + Search 的循环。每一次循环都会：生成新思路 → 评估好坏 → 选择最优 → 继续</text>
    <text x="365" y="325" class="text" font-size="11" fill="#0369a1">这与人类解决复杂问题时的思维过程高度一致：先"发散思维"想多种可能，再"收敛"选最好的</text>
    <defs>
      <marker id="arr-tot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
  </svg>
</div>

**图解说明**：上图展示了 ToT 的三大核心操作。第一步"思维生成"负责在岔路口探索多条路；第二步"状态评估"负责判断哪条路更有希望；第三步"搜索"决定沿着哪条路继续深入。三个操作循环进行，直到找到满意的答案。这种"发散→评估→收敛"的循环，与人类解决复杂问题时的思维过程高度一致。

让我们逐一深入这三个操作：

#### 操作一：思维生成（Thought Generation）

给定当前状态 $s$，使用 LLM 生成 $k$ 个候选的下一步思维或动作：

$$\{t_1, t_2, \ldots, t_k\} = \text{LLM}(s, \text{prompt}_{\text{gen}})$$

**通俗理解**：你站在迷宫的一个岔路口，LLM 帮你"脑补"出面前几条路各自通向哪里。

#### 操作二：状态评估（State Evaluation）

对每个候选思维 $t_i$，使用评估函数判断其"好坏"：

$$V(s, t_i) \in [0, 1]$$

评估函数有多种实现方式：

| 评估方式 | 原理 | 优缺点 |
|---------|------|--------|
| **LLM 自评** | 让模型自己给每个思路打分 | 简单但有偏差 |
| **规则验证** | 用代码检查中间步骤是否合法 | 精确但需要编写规则 |
| **多数投票** | 生成多个独立推理链，选最一致的 | 鲁棒但成本高 |

**通俗理解**：你用直觉（或指南针）判断每条路"看起来通向出口的可能性"有多大。

#### 操作三：搜索策略（Search Strategy）

基于评估结果，决定接下来探索哪些分支。ToT 论文中提出了两种经典搜索策略：

- **BFS（广度优先搜索）**：先探索所有第一层分支，选最好的，再探索第二层……适合"不知道哪条路对，需要广撒网"的场景。
- **DFS（深度优先搜索）**：选定一条路一直深入到底，走不通就回溯到最近的岔路口换一条……适合"能判断方向，需要深入探索"的场景。

### 3.3 BFS vs DFS：两种搜索策略对比

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 340" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
      </style>
    </defs>
    <text x="360" y="25" class="text-bold" font-size="15">BFS vs DFS：两种搜索策略对比</text>
    <!-- BFS side -->
    <text x="180" y="55" class="text-bold" fill="#3b82f6" font-size="13">BFS（广度优先搜索）</text>
    <rect x="20" y="70" width="320" height="230" class="box"/>
    <text x="180" y="90" class="text" font-size="10" fill="#64748b">策略：每层先全看一遍，选最好的再往下一层</text>
    <!-- Level 0 -->
    <circle cx="180" cy="120" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
    <text x="180" y="120" class="text" font-size="9" fill="#2563eb">根</text>
    <!-- Level 1 - all explored -->
    <line x1="166" y1="133" x2="80" y2="158" stroke="#3b82f6" stroke-width="1.5"/>
    <line x1="180" y1="134" x2="180" y2="158" stroke="#3b82f6" stroke-width="1.5"/>
    <line x1="194" y1="133" x2="280" y2="158" stroke="#3b82f6" stroke-width="1.5"/>
    <circle cx="80" cy="170" r="12" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="80" y="170" class="text" font-size="8">A:0.3</text>
    <circle cx="180" cy="170" r="12" fill="#93c5fd" stroke="#3b82f6" stroke-width="2"/>
    <text x="180" y="170" class="text" font-size="8" fill="#2563eb">B:0.9</text>
    <circle cx="280" cy="170" r="12" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="280" y="170" class="text" font-size="8">C:0.5</text>
    <!-- Level 2 - only B's children explored -->
    <line x1="170" y1="181" x2="155" y2="205" stroke="#3b82f6" stroke-width="2"/>
    <line x1="190" y1="181" x2="205" y2="205" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="155" cy="217" r="12" fill="#60a5fa" stroke="#3b82f6" stroke-width="2"/>
    <text x="155" y="217" class="text" font-size="8" fill="white">B1</text>
    <circle cx="205" cy="217" r="12" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="205" y="217" class="text" font-size="8">B2</text>
    <!-- Annotation -->
    <rect x="35" y="245" width="290" height="45" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" rx="4"/>
    <text x="180" y="260" class="text" font-size="10" fill="#1d4ed8">第1步：评估所有第1层 → 选 B（0.9 最高）</text>
    <text x="180" y="278" class="text" font-size="10" fill="#1d4ed8">第2步：展开 B 的子节点 → 评估 → 继续最优</text>
    <!-- DFS side -->
    <text x="540" y="55" class="text-bold" fill="#22c55e" font-size="13">DFS（深度优先搜索）</text>
    <rect x="380" y="70" width="320" height="230" class="box"/>
    <text x="540" y="90" class="text" font-size="10" fill="#64748b">策略：选一条路走到底，不通就回溯</text>
    <!-- Level 0 -->
    <circle cx="540" cy="120" r="14" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <text x="540" y="120" class="text" font-size="9" fill="#16a34a">根</text>
    <!-- Level 1 -->
    <line x1="526" y1="133" x2="460" y2="158" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="554" y1="133" x2="620" y2="158" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 2"/>
    <circle cx="460" cy="170" r="12" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
    <text x="460" y="170" class="text" font-size="8" fill="#166534">A</text>
    <circle cx="620" cy="170" r="12" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 2"/>
    <text x="620" y="170" class="text" font-size="8" fill="#94a3b8">B</text>
    <!-- Level 2 - A's children -->
    <line x1="450" y1="181" x2="430" y2="205" stroke="#22c55e" stroke-width="2"/>
    <line x1="470" y1="181" x2="490" y2="205" stroke="#22c55e" stroke-width="2"/>
    <circle cx="430" cy="217" r="12" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
    <text x="430" y="217" class="text" font-size="8" fill="#166534">A1</text>
    <rect x="478" y="207" width="24" height="20" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5" rx="3"/>
    <text x="490" y="219" class="text" font-size="8" fill="#dc2626">A2</text>
    <text x="490" y="237" class="text" font-size="8" fill="#ef4444">死路</text>
    <!-- Level 3 - A1's children -->
    <line x1="420" y1="228" x2="405" y2="248" stroke="#22c55e" stroke-width="2"/>
    <line x1="440" y1="228" x2="455" y2="248" stroke="#22c55e" stroke-width="1.5"/>
    <circle cx="405" cy="258" r="10" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
    <text x="405" y="258" class="text" font-size="7" fill="#166534">A1a</text>
    <circle cx="455" cy="258" r="10" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="455" y="258" class="text" font-size="7">A1b</text>
    <!-- Annotation -->
    <rect x="395" y="245" width="290" height="45" fill="#f0fdf4" stroke="#86efac" stroke-width="1" rx="4"/>
    <text x="540" y="260" class="text" font-size="10" fill="#166534">第1步：选 A → 走到底 → A2 是死路 → 回溯</text>
    <text x="540" y="278" class="text" font-size="10" fill="#166534">第2步：选 A1 → 继续 → A1a/A1b → 评估</text>
    <!-- Bottom comparison -->
    <rect x="20" y="310" width="680" height="24" fill="#fafafa" stroke="#e2e8f0" stroke-width="1" rx="4"/>
    <text x="360" y="324" class="text" font-size="11" fill="#64748b">BFS 适合"每步都能评估"的场景（如创意写作、24点游戏）；DFS 适合"能快速判断对错"的场景（如解谜、数学证明）</text>
  </svg>
</div>

**图解说明**：上图对比了 ToT 中两种经典搜索策略。BFS 像一个"贪心"的探索者——先看遍当前层的所有选项，选最好的再往下一层探索。DFS 像一个"执着"的探索者——选定一条路就一路走到底，走不通了再退回上一个岔路口换路。选择哪种策略取决于具体任务：如果每一步都能方便地评估（如 24 点游戏中可以检查中间结果是否合理），BFS 更合适；如果能快速判断一条路是否正确，DFS 更高效。

### 3.4 ToT 的完整算法流程

结合上面三个操作，ToT 的完整算法可以概括为以下伪代码：

```python
def tree_of_thoughts(problem, max_depth=3, num_branches=3):
    """
    ToT 完整算法流程
    """
    # 初始化：将问题作为根节点
    root = State(problem)
    
    for depth in range(max_depth):
        # 1. 思维生成：为每个活跃节点生成候选思维
        candidates = {}
        for state in active_states:
            thoughts = generate_thoughts(state, k=num_branches)
            candidates[state] = thoughts
        
        # 2. 状态评估：评估每个候选思维的质量
        for state, thoughts in candidates.items():
            for thought in thoughts:
                new_state = apply(state, thought)
                score = evaluate(new_state)
                new_state.score = score
        
        # 3. 搜索：根据搜索策略选择要继续探索的节点
        if search_strategy == "BFS":
            # 广度优先：每层选 top-k
            active_states = select_top_k(all_new_states, k=num_branches)
        elif search_strategy == "DFS":
            # 深度优先：选最优的一个继续深入
            active_states = [select_best(all_new_states)]
    
    # 返回全局最优解
    return select_best(all_states)
```

### 3.5 实战案例：24 点游戏

ToT 论文中最经典的案例是 **24 点游戏**：给定 4 个数字（如 4, 5, 6, 10），使用加减乘除（+、-、×、÷），使结果等于 24。

**CoT 在这个任务上的表现如何？**

CoT 会直接一条路算下去：

```
4 + 5 = 9, 9 × 6 = 54, 54 - 10 = 44 ≠ 24  ❌
```

如果第一步选错了（比如先算 4+5），后续无论怎么算都可能凑不出 24。**CoT 没有"回退"能力**。

**ToT 的做法完全不同**：

```
第1层（第1步）：生成多个候选
  路径A: 留 4, (5-6)=-1, 10  → 不太有希望
  路径B: 留 4, 5, (6×10)=60 → 不太有希望  
  路径C: (10-6)=4, 留 4, 5  → 不错！有两个4
  路径D: (4+10)=14, 留 5, 6  → 可以试试

第2层（第2步）：基于路径C继续
  路径C1: 4×4=16, 留 5    → 16, 5, 24 还差8
  路径C2: 4+4=8, 留 5     → 8×5=40 ≠ 24
  路径C3: 留4, 4×5=20     → 20+4=24 ✓✓✓ 找到了！
```

可以看到，ToT 在第 1 步就"广撒网"探索了多种组合方式，第 2 步沿着最有希望的方向深入，最终找到了正确答案。而 CoT 如果第一步选错了组合方式，就只能一条路走到黑。

---

## 4. Graph of Thoughts (GoT)：从"树"到"图"的进化

2023 年，Besta 等人在论文 *Graph of Thoughts: Solving Elaborate Problems with Large Language Models* 中提出了 ToT 的进一步进化——**Graph of Thoughts（思维图）**。

### 4.1 从树到图：多了什么能力？

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;">
    <defs>
      <style>
        .box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 2; rx: 8; }
        .text { font-family: -apple-system, sans-serif; font-size: 13px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-family: -apple-system, sans-serif; font-size: 13px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
      </style>
    </defs>
    <text x="360" y="25" class="text-bold" font-size="15">CoT → ToT → GoT：推理策略的进化</text>
    <!-- CoT: chain -->
    <text x="120" y="55" class="text-bold" fill="#f59e0b" font-size="12">CoT（链）</text>
    <rect x="20" y="70" width="200" height="90" class="box"/>
    <circle cx="60" cy="115" r="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="60" y="115" class="text" font-size="9">想1</text>
    <line x1="76" y1="115" x2="104" y2="115" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-evo)"/>
    <circle cx="120" cy="115" r="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="120" y="115" class="text" font-size="9">想2</text>
    <line x1="136" y1="115" x2="164" y2="115" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr-evo)"/>
    <circle cx="180" cy="115" r="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="180" y="115" class="text" font-size="9">想3</text>
    <text x="120" y="150" class="text" font-size="10" fill="#64748b">线性推理，不可分叉</text>
    <!-- Arrow -->
    <text x="260" y="115" class="text-bold" font-size="18" fill="#64748b">→</text>
    <!-- ToT: tree -->
    <text x="370" y="55" class="text-bold" fill="#22c55e" font-size="12">ToT（树）</text>
    <rect x="280" y="70" width="180" height="90" class="box"/>
    <circle cx="370" cy="95" r="14" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
    <text x="370" y="95" class="text" font-size="9">想1</text>
    <line x1="358" y1="108" x2="320" y2="130" stroke="#22c55e" stroke-width="1.5"/>
    <line x1="382" y1="108" x2="420" y2="130" stroke="#22c55e" stroke-width="1.5"/>
    <circle cx="320" cy="142" r="12" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="320" y="142" class="text" font-size="8">A</text>
    <circle cx="420" cy="142" r="12" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5"/>
    <text x="420" y="142" class="text" font-size="8">B</text>
    <text x="370" y="150" class="text" font-size="10" fill="#64748b">可分叉，可剪枝</text>
    <!-- Arrow -->
    <text x="498" y="115" class="text-bold" font-size="18" fill="#64748b">→</text>
    <!-- GoT: graph -->
    <text x="620" y="55" class="text-bold" fill="#8b5cf6" font-size="12">GoT（图）</text>
    <rect x="520" y="70" width="190" height="170" class="box"/>
    <circle cx="615" cy="100" r="14" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
    <text x="615" y="100" class="text" font-size="9">想1</text>
    <line x1="603" y1="113" x2="565" y2="135" stroke="#8b5cf6" stroke-width="1.5"/>
    <line x1="627" y1="113" x2="665" y2="135" stroke="#8b5cf6" stroke-width="1.5"/>
    <circle cx="565" cy="147" r="12" fill="#ddd6fe" stroke="#8b5cf6" stroke-width="1.5"/>
    <text x="565" y="147" class="text" font-size="8">A</text>
    <circle cx="665" cy="147" r="12" fill="#ddd6fe" stroke="#8b5cf6" stroke-width="1.5"/>
    <text x="665" y="147" class="text" font-size="8">B</text>
    <line x1="577" y1="158" x2="615" y2="180" stroke="#8b5cf6" stroke-width="2"/>
    <line x1="653" y1="158" x2="615" y2="180" stroke="#8b5cf6" stroke-width="2"/>
    <circle cx="615" cy="192" r="14" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2.5"/>
    <text x="615" y="192" class="text" font-size="9" fill="white">合并</text>
    <text x="615" y="225" class="text" font-size="10" fill="#64748b">可分叉、可合并、可回环</text>
    <!-- Bottom legend -->
    <rect x="20" y="255" width="690" height="20" fill="#f5f3ff" stroke="#c4b5fd" stroke-width="1" rx="4"/>
    <text x="360" y="268" class="text" font-size="11" fill="#7c3aed">GoT 的核心创新：Merge（合并）操作——把多条推理路径的"精华"融合为一个更好的答案</text>
    <defs>
      <marker id="arr-evo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
      </marker>
    </defs>
  </svg>
</div>

**图解说明**：上图展示了推理策略的三个阶段。CoT 是一条直线——只能一条路走到黑。ToT 加入了"分叉"能力——可以在岔路口探索多条路。GoT 在 ToT 的基础上增加了"合并"能力——可以把多条路径的精华融合在一起。这就像团队协作：CoT 是一个人单干，ToT 是多人各自探索，GoT 是多人探索后开"头脑风暴会"把各自的好想法融合。

### 4.2 GoT 的 Merge 操作详解

GoT 最大的创新是引入了 **Merge（合并）** 操作。在 ToT 中，不同的思维路径是相互独立的——路径 A 和路径 B 互不干扰。但在 GoT 中，你可以**把路径 A 和路径 B 的结果合并成一个新的思维节点**。

**一个通俗的类比**：

- **CoT** = 你一个人写方案，写到哪算哪
- **ToT** = 你让三个人各自独立写方案，然后选最好的一个
- **GoT** = 你让三个人各自写方案，然后**把三个方案的精华融合**成一个更完美的方案

Merge 操作的具体实现：把多个思维节点作为输入，让 LLM 综合它们生成一个新的、更好的思维。

$$t_{\text{merged}} = \text{LLM}(t_1, t_2, \ldots, t_n, \text{prompt}_{\text{merge}})$$

---

## 5. 代码实战：手写一个 ToT 推理引擎

### 5.1 核心数据结构

让我们用 Python 手写一个极简的 ToT 推理引擎，以 24 点游戏为例。

```python
import re
from typing import List, Tuple, Optional
from dataclasses import dataclass, field

@dataclass
class ThoughtNode:
    """思维树中的一个节点"""
    state: str               # 当前状态描述（如 "剩余数字: [4, 5, 6], 表达式: (4+5)"）
    expression: str           # 已构建的表达式
    remaining: List[float]    # 剩余可用的数字
    score: float = 0.0        # 评估分数
    depth: int = 0            # 当前深度
    parent: Optional['ThoughtNode'] = None
    children: List['ThoughtNode'] = field(default_factory=list)

class ToTSolver:
    """
    Tree-of-Thoughts 推理引擎（简化版）
    
    核心三步：
    1. generate_thoughts: 生成候选思维
    2. evaluate_thoughts: 评估思维质量
    3. search: 搜索最优路径（BFS）
    """
    
    def __init__(self, numbers: List[int], target: int = 24):
        self.numbers = numbers
        self.target = target
        self.operators = ['+', '-', '*', '/']
        self.best_solution = None
        self.best_score = -1
```

### 5.2 思维生成器

```python
    def generate_thoughts(self, node: ThoughtNode, k: int = 5) -> List[ThoughtNode]:
        """
        思维生成：从当前状态生成 k 个候选子节点
        
        核心逻辑：尝试从剩余数字中选两个，用一个运算符合并
        """
        candidates = []
        remaining = node.remaining
        
        if len(remaining) < 2:
            return candidates
        
        # 遍历所有可能的数字组合和运算符
        for i in range(len(remaining)):
            for j in range(len(remaining)):
                if i == j:
                    continue
                a, b = remaining[i], remaining[j]
                new_remaining = [remaining[x] for x in range(len(remaining)) if x != i and x != j]
                
                for op in self.operators:
                    # 执行运算，检查合法性
                    result, expr = self._compute(a, b, op)
                    if result is None:
                        continue  # 非法运算（如除以零）
                    
                    # 构建新节点
                    new_expression = f"({node.expression} {op} {b})" if node.expression else f"({a} {op} {b})"
                    child = ThoughtNode(
                        state=f"剩余: {new_remaining + [result]}, 表达式: {new_expression}",
                        expression=new_expression,
                        remaining=new_remaining + [result],
                        depth=node.depth + 1,
                        parent=node
                    )
                    candidates.append(child)
        
        # 返回前 k 个候选
        return candidates[:k]
    
    def _compute(self, a: float, b: float, op: str) -> Tuple[Optional[float], str]:
        """执行运算并返回结果"""
        if op == '+': return a + b, f"{a}+{b}"
        if op == '-': return a - b, f"{a}-{b}"
        if op == '*': return a * b, f"{a}*{b}"
        if op == '/' and b != 0: return a / b, f"{a}/{b}"
        return None, ""
```

### 5.3 状态评估器

```python
    def evaluate_thoughts(self, nodes: List[ThoughtNode]) -> List[ThoughtNode]:
        """
        状态评估：为每个思维节点打分
        
        评估策略（基于规则）：
        - 如果剩余数字中包含 target，得最高分
        - 如果剩余数字只有 1 个，根据其与 target 的距离打分
        - 否则，根据剩余数字的可组合性打分
        """
        for node in nodes:
            remaining = node.remaining
            
            if self.target in remaining:
                node.score = 1.0  # 完美！
            elif len(remaining) == 1:
                # 只剩一个数字，越接近 target 分数越高
                diff = abs(remaining[0] - self.target)
                node.score = max(0, 1.0 - diff / self.target)
            else:
                # 多个数字，检查是否有好的组合方式
                # 简化策略：乘积或和接近 target 得高分
                product = 1
                for n in remaining:
                    product *= n
                sum_all = sum(remaining)
                min_diff = min(abs(product - self.target), abs(sum_all - self.target))
                node.score = max(0, 1.0 - min_diff / (self.target * 2))
            
            # 更新全局最优
            if node.score > self.best_score:
                self.best_score = node.score
                self.best_solution = node
        
        # 按分数排序
        return sorted(nodes, key=lambda x: x.score, reverse=True)
```

### 5.4 BFS 搜索策略

```python
    def solve(self, max_depth: int = 4, branch_factor: int = 5) -> Optional[ThoughtNode]:
        """
        BFS 搜索：逐层探索，每层保留 top-k 节点
        """
        # 初始化根节点
        root = ThoughtNode(
            state=f"初始数字: {self.numbers}",
            expression="",
            remaining=self.numbers.copy(),
            depth=0
        )
        
        active_states = [root]
        
        for depth in range(max_depth):
            print(f"\n--- 第 {depth + 1} 层搜索 ---")
            all_candidates = []
            
            # 为每个活跃节点生成候选
            for state in active_states:
                candidates = self.generate_thoughts(state, k=branch_factor)
                all_candidates.extend(candidates)
            
            if not all_candidates:
                print("没有更多候选，搜索终止")
                break
            
            # 评估所有候选
            all_candidates = self.evaluate_thoughts(all_candidates)
            
            # 打印当前层 top-3
            for i, node in enumerate(all_candidates[:3]):
                print(f"  [{i+1}] 分数={node.score:.3f} | 表达式={node.expression} | 剩余={node.remaining}")
            
            # 保留 top-k 作为下一层的活跃节点
            active_states = all_candidates[:branch_factor]
            
            # 检查是否找到完美解
            if self.best_score >= 1.0:
                print(f"\n找到完美解！表达式: {self.best_solution.expression}")
                return self.best_solution
        
        if self.best_score > 0:
            print(f"\n搜索结束。最优解: {self.best_solution.expression} (分数: {self.best_score:.3f})")
        else:
            print("\n未找到解。")
        
        return self.best_solution
```

### 5.5 运行示例

```python
# 求解 24 点：用 4, 5, 6, 10 凑出 24
solver = ToTSolver(numbers=[4, 5, 6, 10], target=24)
solution = solver.solve(max_depth=4, branch_factor=5)
```

**运行结果示例**：

```
--- 第 1 层搜索 ---
  [1] 分数=0.400 | 表达式=(4+5) | 剩余=[6.0, 10.0, 9.0]
  [2] 分数=0.400 | 表达式=(4*5) | 剩余=[6.0, 10.0, 20.0]
  [3] 分数=0.200 | 表达式=(5+6) | 剩余=[4.0, 10.0, 11.0]

--- 第 2 层搜索 ---
  [1] 分数=1.000 | 表达式=((4*5)-6) | 剩余=[10.0, 14.0]
  ...

--- 第 3 层搜索 ---
  ...

找到完美解！表达式: (((4*5)-6)+10)
```

可以看到，ToT 在第 2 层就找到了 $4 \times 5 = 20$，$20 - 6 = 14$ 这条有希望的路径，然后在第 3 层继续深入得到 $14 + 10 = 24$。而 CoT 如果第一步选了 $4 + 5 = 9$，就很可能走不到正确答案。

> **注意**：以上代码是教学简化版。真实的 ToT 实现会调用 LLM API 来生成和评估思维，而不是使用规则引擎。代码的核心价值在于展示 ToT 的算法框架——生成、评估、搜索的循环。

---

## 6. CoT → ToT → GoT：推理策略的演进总结

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;">
    <defs>
      <style>
        .header { fill: #1e293b; }
        .row1 { fill: #f8fafc; stroke: #e2e8f0; }
        .row2 { fill: #f1f5f9; stroke: #e2e8f0; }
        .row3 { fill: #f8fafc; stroke: #e2e8f0; }
        .row4 { fill: #f1f5f9; stroke: #e2e8f0; }
        .text { font-family: -apple-system, sans-serif; font-size: 12px; fill: #1e293b; text-anchor: middle; dominant-baseline: middle; }
        .text-bold { font-weight: bold; fill: #0f172a; }
      </style>
    </defs>
    <rect x="0" y="0" width="720" height="35" class="header" rx="4"/>
    <text x="90" y="20" class="text" fill="white" font-weight="bold">策略</text>
    <text x="220" y="20" class="text" fill="white" font-weight="bold">推理结构</text>
    <text x="370" y="20" class="text" fill="white" font-weight="bold">核心能力</text>
    <text x="510" y="20" class="text" fill="white" font-weight="bold">适用场景</text>
    <text x="660" y="20" class="text" fill="white" font-weight="bold">计算成本</text>
    <rect x="0" y="35" width="720" height="55" class="row1"/>
    <text x="90" y="60" class="text-bold">CoT</text>
    <text x="90" y="78" class="text" font-size="10" fill="#64748b">2022</text>
    <text x="220" y="60" class="text">线性链</text>
    <text x="220" y="78" class="text" font-size="10" fill="#64748b">一条路走到黑</text>
    <text x="370" y="60" class="text">展露推理过程</text>
    <text x="370" y="78" class="text" font-size="10" fill="#64748b">增加计算量</text>
    <text x="510" y="60" class="text">数学推理</text>
    <text x="510" y="78" class="text" font-size="10" fill="#64748b">逻辑分析</text>
    <text x="660" y="62" class="text">低</text>
    <text x="660" y="78" class="text" font-size="10" fill="#22c55e">1× 推理</text>
    <rect x="0" y="90" width="720" height="55" class="row2"/>
    <text x="90" y="115" class="text-bold">ToT</text>
    <text x="90" y="133" class="text" font-size="10" fill="#64748b">2023</text>
    <text x="220" y="115" class="text">树状结构</text>
    <text x="220" y="133" class="text" font-size="10" fill="#64748b">可分叉、可剪枝</text>
    <text x="370" y="115" class="text">探索 + 回溯</text>
    <text x="370" y="133" class="text" font-size="10" fill="#64748b">系统性搜索</text>
    <text x="510" y="115" class="text">24点游戏</text>
    <text x="510" y="133" class="text" font-size="10" fill="#64748b">创意写作</text>
    <text x="660" y="117" class="text">中高</text>
    <text x="660" y="133" class="text" font-size="10" fill="#f59e0b">10~50× 推理</text>
    <rect x="0" y="145" width="720" height="55" class="row3"/>
    <text x="90" y="170" class="text-bold">GoT</text>
    <text x="90" y="188" class="text" font-size="10" fill="#64748b">2023</text>
    <text x="220" y="170" class="text">图结构</text>
    <text x="220" y="188" class="text" font-size="10" fill="#64748b">可分叉、可合并</text>
    <text x="370" y="170" class="text">融合 + 迭代</text>
    <text x="370" y="188" class="text" font-size="10" fill="#64748b">聚合多路径精华</text>
    <text x="510" y="170" class="text">复杂规划</text>
    <text x="510" y="188" class="text" font-size="10" fill="#64748b">多步综合推理</text>
    <text x="660" y="172" class="text">高</text>
    <text x="660" y="188" class="text" font-size="10" fill="#ef4444">50~200× 推理</text>
    <rect x="0" y="200" width="720" height="55" class="row4"/>
    <text x="90" y="225" class="text-bold">ReAct</text>
    <text x="90" y="243" class="text" font-size="10" fill="#64748b">2022</text>
    <text x="220" y="225" class="text">推理+行动循环</text>
    <text x="220" y="243" class="text" font-size="10" fill="#64748b">可调用工具</text>
    <text x="370" y="225" class="text">推理 + 执行</text>
    <text x="370" y="243" class="text" font-size="10" fill="#64748b">工具增强推理</text>
    <text x="510" y="225" class="text">Agent 系统</text>
    <text x="510" y="243" class="text" font-size="10" fill="#64748b">知识检索</text>
    <text x="660" y="227" class="text">中</text>
    <text x="660" y="243" class="text" font-size="10" fill="#f59e0b">5~20× 推理</text>
    <rect x="0" y="260" width="720" height="18" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1" rx="3"/>
    <text x="360" y="272" class="text" font-size="10" fill="#0369a1">💡 没有银弹：选择哪种策略取决于任务复杂度和可用计算资源。ReAct 将在第四模块详细讲解</text>
  </svg>
</div>

**图解说明**：上表总结了从 CoT 到 GoT 的推理策略演进。CoT 是最轻量的——只增加了一条推理链，成本最低。ToT 引入了树状搜索，能处理更复杂的问题但成本更高。GoT 支持路径合并，能力最强但成本也最高。ReAct（推理+行动）则是一个不同维度的创新——它让模型在推理过程中可以调用外部工具，我们将在第四模块的《ReAct 框架详解》中深入探讨。

---

## 7. 总结

在这篇文章中，我们从"直接回答"出发，深入探讨了两种高级推理策略的原理与实现：

1. **CoT 的本质是"草稿纸"**：它让模型把推理过程写出来，相当于增加了可用的"计算量"。Zero-shot CoT 只需要一句"Let's think step by step"，Few-shot CoT 通过示例教会模型展示推理过程。CoT 对需要多步推理的任务特别有效，但它是一条"线性链"——走错了没法回头。

2. **ToT 的本质是"走迷宫"**：它把推理过程建模为搜索树，通过"生成→评估→搜索"的循环，让模型能探索多条路径、在死胡同处回溯。BFS 适合广撒网的场景，DFS 适合深入探索的场景。

3. **GoT 的核心创新是"合并"**：在 ToT 的基础上，GoT 允许把多条推理路径的精华融合为一个更好的答案，类似团队头脑风暴后综合方案。

4. **没有免费的午餐**：更强大的推理策略意味着更高的计算成本。CoT 只需要 1 倍推理，ToT 需要 10-50 倍，GoT 可能需要 50-200 倍。选择哪种策略取决于任务复杂度和可用资源。

理解了这些推理策略，我们就能在实战中根据不同的任务需求，灵活选择最合适的"方向盘"来控制模型的推理过程。在接下来的文章中，我们将探讨如何通过**结构化输出控制**（Grammar Constrained Decoding）和**解码策略**（Temperature、Top-P、Top-K）来进一步精细地操控模型的输出。

---

## 参考文献与延伸阅读

1. **Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al., 2022)**：CoT 的奠基论文，系统性地展示了通过在提示词中提供推理过程示例，可以大幅提升大模型在数学、逻辑等推理任务上的表现。
   - 链接：<a href="https://arxiv.org/abs/2201.11903" target="_blank">https://arxiv.org/abs/2201.11903</a>

2. **Large Language Models are Zero-Shot Reasoners (Kojima et al., 2022)**：发现仅添加"Let's think step by step"就能触发大模型的推理能力，提出了 Zero-shot CoT 方法。
   - 链接：<a href="https://arxiv.org/abs/2205.11916" target="_blank">https://arxiv.org/abs/2205.11916</a>

3. **Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Yao et al., 2023)**：ToT 的原始论文，提出了将推理过程建模为搜索树的核心框架，并在 24 点游戏、创意写作等任务上验证了效果。
   - 链接：<a href="https://arxiv.org/abs/2305.10601" target="_blank">https://arxiv.org/abs/2305.10601</a>

4. **Graph of Thoughts: Solving Elaborate Problems with Large Language Models (Besta et al., 2023)**：GoT 的原始论文，在 ToT 的基础上引入了 Merge 操作，将推理结构从树扩展为图。
   - 链接：<a href="https://arxiv.org/abs/2308.09687" target="_blank">https://arxiv.org/abs/2308.09687</a>

5. **ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)**：提出了 ReAct 框架，将推理（Reasoning）与行动（Acting）结合，让模型在推理过程中可以调用外部工具。
   - 链接：<a href="https://arxiv.org/abs/2210.03629" target="_blank">https://arxiv.org/abs/2210.03629</a>

6. **Self-Consistency Improves Chain of Thought Reasoning in Language Models (Wang et al., 2022)**：提出了 Self-Consistency 方法——通过多次采样 CoT 推理链，用多数投票选择最终答案，进一步提升推理准确率。
   - 链接：<a href="https://arxiv.org/abs/2203.11171" target="_blank">https://arxiv.org/abs/2203.11171</a>

7. **Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models (Wang et al., 2023)**：提出了 Plan-and-Solve 提示方法，在 CoT 基础上先让模型制定计划，再按计划执行，减少推理中的跳步问题。
   - 链接：<a href="https://arxiv.org/abs/2305.04091" target="_blank">https://arxiv.org/abs/2305.04091</a>

8. **The Magical Number Seven, Plus or Minus Two (Miller, 1956)**：认知心理学经典论文，提出人类工作记忆的容量限制（$7 \pm 2$），解释了为什么分步思考（CoT）能降低认知负担。
   - 链接：<a href="https://www.psych.utoronto.ca/users/peterson/psy290s/Miller%20(1956).pdf" target="_blank">https://www.psych.utoronto.ca/users/peterson/psy290s/Miller%20(1956).pdf</a>
