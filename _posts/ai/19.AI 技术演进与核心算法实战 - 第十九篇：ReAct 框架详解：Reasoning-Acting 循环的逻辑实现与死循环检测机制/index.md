---
title: "AI 技术演进与核心算法实战 | 第十九篇：ReAct 框架详解：Reasoning + Acting 循环的逻辑实现与死循环检测机制"
excerpt: "赋予 AI '手'和'脑'的终极范式。深入解析 ReAct (Reasoning + Acting) 框架，探讨思维链与工具调用的交织逻辑，并手写一个具备死循环检测的极简 Agent 引擎。"
description: "AI 技术演进与核心算法实战第十九篇：ReAct 框架详解：Reasoning + Acting 循环的逻辑实现与死循环检测机制"
keyword: "AI,大模型,Agent,ReAct,Reasoning,Acting,死循环检测,LangChain"
tag: "AI"
date: "2026-03-02 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战 - 第十九篇：ReAct-框架详解：Reasoning-+-Acting-循环的逻辑实现与死循环检测机制/assets/cover/react-framework-cover.svg"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战 - 第十九篇：ReAct-框架详解：Reasoning-+-Acting-循环的逻辑实现与死循环检测机制/assets/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战 - 第十九篇：ReAct-框架详解：Reasoning-+-Acting-循环的逻辑实现与死循环检测机制/assets/cover/react-framework-cover.svg"
---

> 思考是行动的指南，行动是思考的验证。在 Reasoning 与 Acting 的交织中，智能才得以涌现。

在之前的篇章中，我们探讨了 Function Calling（函数调用）的原理以及代码解释器的沙箱构建。我们已经赋予了模型“手”（执行工具的能力）。但仅仅有手是不够的，一个真正的智能体（Agent）还需要知道**什么时候该伸手，伸向哪里，以及如何根据结果调整下一步的动作**。

这就是 **ReAct (Reasoning + Acting)** 框架的用武之地。它不仅是目前最主流的 Agent 架构，更是连接大语言模型（LLM）与现实世界的桥梁。

本篇是 **《AI 技术演进与核心算法实战》第四模块：行动篇** 的核心篇章。我们将拆解 ReAct 的运行逻辑，并用 Python 手写一个具备**死循环检测机制**的极简 ReAct 引擎。

## 1. 为什么我们需要 ReAct？

在 ReAct 出现之前，我们处理复杂任务通常有两种路径：
1. **纯推理（Reasoning Only）**：比如 Chain-of-Thought (CoT)。模型在内部进行逻辑推导，但它无法获取外部信息（如实时天气、数据库数据），也无法对世界产生实际影响。
2. **纯行动（Acting Only）**：早期的任务型对话系统。它们根据固定的意图识别去触发 API，但缺乏灵活性，一旦遇到预设流程之外的情况就会“卡壳”。

**ReAct 的核心洞察在于：** 推理和行动并不是孤立的，它们是相辅相成的。
*   **推理（Reasoning）** 帮助模型制定计划、分解任务，并根据观察结果调整策略。
*   **行动（Acting）** 让模型能够与外部环境交互，获取缺失的信息或执行具体的指令。

<figure style="text-align: center; margin: 30px 0;">
  <img src="/assets/posts/AI-技术演进与核心算法实战-第十九篇：ReAct-框架详解：Reasoning-+-Acting-循环的逻辑实现与死循环检测机制/cover/react-framework-cover.svg" alt="ReAct Framework Cycle" style="max-width: 100%; height: auto;" />
  <figcaption style="color: #64748b; font-size: 14px; margin-top: 10px;">ReAct 循环：思考 -> 行动 -> 观察 -> 再思考</figcaption>
</figure>

## 2. ReAct 的核心逻辑：Thought, Action, Observation

ReAct 框架通过一种特定的提示词（Prompt）格式，引导 LLM 进入一个迭代循环。这个循环由三个关键部分组成：

1. **Thought（思考）**：模型分析当前的问题或上一步的观察结果，决定接下来该做什么。这是模型的“内心独白”。
2. **Action（行动）**：模型选择一个可用的工具（Tool），并提供相应的输入参数。
3. **Observation（观察）**：执行工具后返回的结果。这个结果会作为新的上下文反馈给模型，触发下一轮的 Thought。

### 一个典型的 ReAct 执行流示例

假设用户问：“**特斯拉现在的股价是多少？如果高于 200 美元，帮我写一封简短的提醒邮件。**”

| 步骤 | 角色 | 内容 |
| :--- | :--- | :--- |
| **1** | **Thought** | 我需要先查询特斯拉（TSLA）的实时股价。 |
| **2** | **Action** | `SearchStockPrice(ticker="TSLA")` |
| **3** | **Observation** | `215.5 USD` |
| **4** | **Thought** | 股价是 215.5 美元，高于 200 美元。现在我需要起草一封提醒邮件。 |
| **5** | **Action** | `DraftEmail(subject="TSLA Alert", body="Tesla stock is currently at $215.5.")` |
| **6** | **Observation** | `Email drafted successfully.` |
| **7** | **Thought** | 任务已完成。 |
| **8** | **Final Answer** | 特斯拉当前股价为 215.5 美元，已为您起草提醒邮件。 |

这种结构化的输出让模型不再是“瞎猜”，而是像人类工程师一样，一边查文档（Observation），一边写代码（Action），一边思考逻辑（Thought）。

## 3. 代码实战：手写一个带“防呆设计”的 ReAct 引擎

虽然 LangChain 等库已经封装好了 ReAct，但理解其底层的状态机流转至关重要。更重要的是，LLM 在执行循环时极易陷入**死循环**（例如反复调用同一个无效的工具）。

下面我们用 Python 实现一个极简的 ReAct 引擎，重点展示**状态管理**和**死循环检测**。

> 💡 **运行环境准备**：
> 
> 本节代码需要安装 `openai` 库。你可以使用 `pip install openai` 进行安装。
> 
> 完整源码位于本文配套文章目录的 `src/react_agent.py`。

### 3.1 定义工具与基础结构

首先，我们需要定义一些简单的工具供 Agent 调用。

```python
import json
import time

# 模拟的工具库
TOOLS = {
    "get_current_weather": lambda loc: f"The weather in {loc} is sunny, 25°C.",
    "search_stock_price": lambda ticker: f"{ticker} is currently trading at $215.5.",
    "calculator": lambda expr: str(eval(expr)) if all(c in "0123456789+-*/. " for c in expr) else "Invalid expression"
}

def get_tool_description():
    return json.dumps([{"name": name, "description": "A tool to perform specific tasks"} for name in TOOLS.keys()], indent=2)
```

### 3.2 实现 ReAct 循环与死循环检测

这是引擎的核心。我们通过维护一个 `history` 列表来记录所有的 Thought, Action 和 Observation。

```python
class SimpleReActAgent:
    def __init__(self, llm_client, max_iterations=5):
        self.llm = llm_client
        self.max_iterations = max_iterations
        self.history = []

    def _detect_loop(self, current_action):
        """
        死循环检测：检查最近几次是否重复了相同的动作。
        """
        if len(self.history) < 4:
            return False
        
        # 提取最近的 Action 记录
        recent_actions = [h['action'] for h in self.history[-3:] if h.get('action')]
        
        # 如果最近 3 次 Action 完全一致，判定为死循环
        if len(recent_actions) == 3 and all(a == current_action for a in recent_actions):
            return True
        return False

    def run(self, query):
        self.history.append({"role": "user", "content": query})
        
        for i in range(self.max_iterations):
            print(f"\n--- Iteration {i+1} ---")
            
            # 1. 构造 Prompt (包含历史上下文和工具描述)
            prompt = self._build_prompt()
            
            # 2. 调用 LLM 生成 Thought 和 Action
            response = self.llm.chat.completions.create(
                model="gpt-3.5-turbo", # 示例模型
                messages=[{"role": "system", "content": prompt}]
            )
            content = response.choices[0].message.content
            
            # 3. 解析 LLM 的输出 (简化版解析逻辑)
            thought, action = self._parse_response(content)
            print(f"Thought: {thought}")
            print(f"Action: {action}")

            # 4. 死循环检测
            if self._detect_loop(action):
                return "Error: Agent detected a loop. Stopping execution."

            # 5. 执行工具并获取 Observation
            if action in TOOLS:
                # 这里简化了参数提取，实际生产中需要更复杂的 JSON 解析
                observation = TOOLS[action]("dummy_input") 
                print(f"Observation: {observation}")
                self.history.append({"role": "assistant", "action": action, "observation": observation})
            else:
                # 如果没有 Action，说明模型给出了最终答案
                return content
                
        return "Error: Max iterations reached."

    def _build_prompt(self):
        # 在实际工程中，这里会使用 Jinja2 等模板引擎
        tools_str = get_tool_description()
        history_str = "\n".join([str(h) for h in self.history])
        return f"You are a helpful assistant. Use the following tools: {tools_str}. \nHistory: {history_str}\nRespond with Thought and Action."

    def _parse_response(self, text):
        # 极简解析：寻找 "Action:" 关键字
        if "Action:" in text:
            parts = text.split("Action:")
            return parts[0].replace("Thought:", "").strip(), parts[1].strip()
        return text, None
```

### 3.3 为什么死循环检测如此重要？

在 ReAct 框架中，LLM 可能会因为以下原因陷入死循环：
1. **工具调用失败**：模型反复调用一个参数错误的工具，而 Observation 总是返回错误信息，模型却无法从中吸取教训修正参数。
2. **逻辑死锁**：模型在两个状态之间反复横跳（例如：先查天气，再查日期，再查天气...）。

我们在代码中实现的 `_detect_loop` 方法采用了一种简单的**滑动窗口比对**。在生产环境中，你还可以通过以下方式增强检测：
*   **Token 消耗监控**：如果单次任务的 Token 消耗远超预期，强制中断。
*   **语义相似度比对**：使用 Embedding 计算连续几次 Thought 的相似度，如果过高则判定为原地踏步。

## 4. ReAct 的局限性与进阶优化

虽然 ReAct 极其强大，但它也有明显的短板：
*   **延迟高**：每执行一步工具都需要一次完整的 LLM 请求，多步任务会导致用户等待时间过长。
*   **脆弱性**：如果 LLM 在某一步解析错了工具的返回结果，后续的整个推理链条都会崩塌（Error Propagation）。

为了解决这些问题，业界正在向 **Plan-and-Solve** 和 **Reflexion（自我反思）** 演进。模型不再只是机械地执行 ReAct 循环，而是会在行动前先制定一个全局计划（Plan），并在行动后对自己的表现进行打分和修正。

## 结语

ReAct 框架通过将“思考”与“行动”显式地交织在一起，让大模型从单纯的“聊天机器人”进化为了能够解决复杂问题的“智能体”。

理解了 ReAct，你就掌握了构建现代 AI Agent 的钥匙。但这把钥匙如何转动得更稳、更快？如何在多步任务中实现自动重试和回滚？

下一篇，我们将深入探讨 **《自主规划算法：Plan-and-Solve、Reflexion 与 LLM 决策树搜索》**，看看 AI 是如何学会“三思而后行”的。

---

## 📚 参考文献与延伸阅读

1. **ReAct: Synergizing Reasoning and Acting in Language Models** (Yao et al., 2023) - ReAct 框架的奠基论文，详细阐述了推理与行动协同工作的原理。
2. **LangChain Documentation: Agents** - 工业界最流行的 ReAct 实现参考，提供了丰富的 Tool 集成案例。
3. **Self-Refine: Iterative Refinement with Self-Feedback** (Madaan et al., 2023) - 探讨了模型如何通过自我反馈来优化输出，是 Reflexion 算法的前奏。

---
> **下一篇预告：** [自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索](#)
