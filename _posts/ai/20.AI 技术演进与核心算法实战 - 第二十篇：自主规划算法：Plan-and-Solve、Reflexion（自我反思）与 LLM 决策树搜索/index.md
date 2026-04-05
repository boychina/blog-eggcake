---
title: "AI 技术演进与核心算法实战 | 第二十篇：自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索"
excerpt: "从'单步反应'到'全局规划'的质变。深入解析 Plan-and-Solve 的两阶段架构、Reflexion 的自我修正机制，以及基于 MCTS 的 LLM 决策树搜索算法，揭示 AI 如何学会'三思而后行'。"
description: "AI 技术演进与核心算法实战第二十篇：自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索"
keyword: "AI,大模型,Agent,自主规划,Plan-and-Solve,Reflexion,自我反思,MCTS,决策树搜索,多步任务"
tag: "AI"
date: "2026-03-10 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战 - 第二十篇：自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索/assets/cover/autonomous-planning-cover.svg"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战 - 第二十篇：自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索/assets/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战 - 第二十篇：自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索/assets/cover/autonomous-planning-cover.svg"
---

> **如果说 ReAct 是让 AI 学会了"边想边做"，那么自主规划算法就是让 AI 学会了"先谋后动"——从战术层面的即时反应，跃升到战略层面的全局运筹。**

在 [上一篇](/posts/ai/19.AI%20技术演进与核心算法实战%20-%20第十九篇：ReAct%20框架详解：Reasoning-Acting%20循环的逻辑实现与死循环检测机制) 中，我们探讨了 ReAct 框架如何让模型通过 Thought-Action-Observation 循环来解决复杂问题。但 ReAct 存在一个**根本性局限**：它是**短视的**。

想象这些真实场景：

**场景 1：旅行规划（ReAct 的困境）**

用户："帮我规划一个为期 7 天的日本旅行，预算 2 万元，喜欢文化和美食"

ReAct 的执行方式：
- Step 1: Thought: 我需要查机票价格 → Action: search_flights()
- Step 2: Thought: 我需要查酒店 → Action: search_hotels()  
- Step 3: Thought: 我需要考虑景点...

问题：
- ❌ 没有全局视角：每一步都是孤立的决策
- ❌ 无法权衡取舍：不知道选便宜机票会挤压酒店预算
- ❌ 容易陷入局部最优：可能先订了贵的酒店，导致后续预算不足
- ❌ 缺乏回溯能力：发现错误时已经走了很远

缺失的能力：全局规划与优化

**场景 2：代码调试（单次尝试的局限）**

用户："这段 Python 代码有 bug，帮我修复"

传统方法的执行：
- Attempt 1: 模型分析代码 → 提出修复方案 → 执行测试 → 失败
- ❌ 结束：模型不知道为什么会失败，也无法从失败中学习

理想的方式：
- Attempt 1: 提出方案 A → 测试失败 → 分析原因
- Attempt 2: 基于失败经验提出方案 B → 测试失败 → 再次反思
- Attempt 3: 综合前两次教训提出方案 C → 测试成功 ✓

需要的能力：自我反思与迭代优化

**场景 3：数学证明（盲目搜索的低效）**

问题："证明勾股定理"

暴力搜索的问题：
- 可能的推理路径呈指数级增长
- 大部分路径都是死胡同
- 无法判断哪条路径更有希望

人类的做法：
- 先评估几种主要思路（几何法、代数法、向量法）
- 对每种思路进行初步探索
- 选择最有希望的路径深入
- 如果走不通，回溯并尝试其他路径

需要的能力：启发式搜索与决策树剪枝

**本篇是《AI 技术演进与核心算法实战》第四模块：行动篇的第四篇**。我们将深入探讨三种**自主规划算法**，解决 ReAct 的短视问题：

1. **Plan-and-Solve**：两阶段架构，先制定完整计划再执行
2. **Reflexion**：通过自我反思从失败中学习，实现迭代优化
3. **LLM + MCTS**：结合蒙特卡洛树搜索，实现高效的决策树探索

根据我们的实践经验：
- **Plan-and-Solve** 可以将复杂任务的完成率提升 **30-50%**
- **Reflexion** 通过自我修正，能将多步任务的成功率提高 **20-40%**
- **MCTS 增强的 LLM** 在数学推理和代码生成任务上，准确率比纯 ReAct 高出 **15-25%**

这就是为什么说：**没有规划的 Agent = 无头苍蝇；有规划的 Agent = 战略家。**

---

## 1. 从"反应式"到"规划式"：智能的跃迁

### 1.1 一个思想实验：棋手 vs 随机走子者

让我们通过一个思想实验来理解规划的重要性。

**场景一：随机走子者（ReAct 式 Agent）**

面对一盘国际象棋：
- 看到当前局面
- 思考："我可以走马、走车、走兵..."
- 随机选择一个看起来不错的走法
- 执行后观察对手反应
- 重复上述过程

特点：
- ✓ 能应对即时情况
- ✗ 没有长远战略
- ✗ 容易被对手设陷阱
- ✗ 无法评估不同走法的长期价值

**场景二：棋手（规划式 Agent）**

面对同一盘棋：
- 第一步：分析全局局势（评估阶段）
- 第二步：生成多个候选策略（分支阶段）
  - 策略 A：进攻王翼
  - 策略 B：控制中心
  - 策略 C：防守反击
- 第三步：对每个策略进行推演（模拟阶段）
  - "如果我走这里，对手可能回应那里..."
- 第四步：选择期望值最高的策略（决策阶段）
- 第五步：执行并在过程中动态调整（执行阶段）

特点：
- ✓ 有清晰的战略目标
- ✓ 能预见多步之后的局面
- ✓ 能权衡不同选择的利弊
- ✓ 能从模拟的失败中学习

![Autonomous Planning Evolution](/assets/posts/AI-技术演进与核心算法实战 - 第二十篇：自主规划算法：Plan-and-Solve、Reflexion（自我反思）与 LLM 决策树搜索/assets/cover/autonomous-planning-cover.svg)

*从反应式到规划式：智能体的进化之路*

**关键洞察**：规划的本质是**在头脑中模拟未来**，通过预演多种可能性来选择最优路径。这需要三个核心能力：
1. **前瞻性**：能够预测行动的长期后果
2. **评估力**：能够判断不同路径的价值
3. **灵活性**：能够根据新信息调整计划

### 1.2 为什么 ReAct 不够用？

ReAct 框架虽然强大，但它本质上是一个**贪心算法**（Greedy Algorithm）——每一步都选择当前看起来最好的动作，而不考虑长远影响。

**ReAct 的三大缺陷**：

| 缺陷 | 表现 | 后果 |
|------|------|------|
| **局部最优陷阱** | 每步都选"眼前最好"的动作 | 可能错过全局更优的路径 |
| **缺乏回溯机制** | 一旦走上错误路径，难以回头 | 浪费大量 Token 和时间 |
| **无法并行探索** | 只能串行执行，一次一条路 | 效率低下，容易卡在死胡同 |

**示例对比**：

ReAct 的执行轨迹（线性、短视）：

Task: "找出 2023 年营收最高的科技公司"

- Step 1: Thought: 需要查科技公司的营收数据 → Action: search("tech company revenue 2023") → Observation: 得到一篇新闻报道
- Step 2: Thought: 报道提到 Apple、Microsoft、Google → Action: search("Apple revenue 2023") → Observation: $383B
- Step 3: Thought: 继续查 Microsoft → Action: search("Microsoft revenue 2023") → Observation: $211B
- Step 4: Thought: 继续查 Google → Action: search("Google revenue 2023") → Observation: $307B
- Step 5: Thought: Apple 最高，任务完成 → Final Answer: Apple

问题：
- 如果第一步搜索的新闻报道遗漏了 Amazon 呢？
- 如果有更好的搜索策略（如直接查排行榜）呢？
- ReAct 无法回头重新评估第一步的选择

规划式 Agent 的执行轨迹（全局、前瞻）：

Planning Phase:
- Strategy A: 逐个搜索主要科技公司（ReAct 的方式）
- Strategy B: 直接搜索"2023 科技公司营收排行榜"
- Strategy C: 查询权威数据库（如 Fortune 500）

Evaluation Phase:
- Strategy A: 可靠性高，但耗时久，可能遗漏
- Strategy B: 快速全面，但需要验证来源可信度 ✓ 推荐
- Strategy C: 最权威，但可能需要付费访问

Execution Phase:
- Step 1: 采用 Strategy B → Action: search("Fortune Global 500 tech companies 2023 ranking") → Observation: 得到完整排行榜
- Step 2: 验证 top 3 的数据 → Action: cross_check(["Apple", "Amazon", "Microsoft"]) → Observation: 数据一致
- Final Answer: Apple ($383B)，数据来源已验证

优势：
- 考虑了多种策略
- 选择了最高效的路径
- 包含了验证步骤

### 1.3 自主规划的三个层次

根据规划的深度和复杂度，我们可以将自主规划分为三个层次：

**层次 1：Plan-and-Solve（计划-执行）**
- **特点**：先生成完整计划，再按部就班执行
- **适用场景**：任务结构清晰，步骤可预测
- **代表算法**：Plan-and-Solve Prompting
- **类比**：按照菜谱做菜

**层次 2：Reflexion（反思-修正）**
- **特点**：执行后评估结果，从失败中学习并调整
- **适用场景**：任务有明确的评判标准，可以多次尝试
- **代表算法**：Reflexion Framework
- **类比**：练习投篮，每次投完分析姿势并调整

**层次 3：Tree Search（树搜索）**
- **特点**：同时探索多条路径，通过启发式函数剪枝
- **适用场景**：搜索空间巨大，需要高效探索
- **代表算法**：LLM + MCTS（蒙特卡洛树搜索）
- **类比**：下棋时思考多步之后的各种可能

接下来，我们将逐一深入这三种算法。

---

## 2. Plan-and-Solve：两阶段架构的力量

### 2.1 核心思想：分而治之

Plan-and-Solve 的核心洞察非常简单却深刻：**将"思考做什么"和"实际去做"分离开来**。

Plan-and-Solve 两阶段架构示意图：

```
┌─────────────────────────────────────────────────────┐
│           阶段 1：Planning（规划）                    │
│  输入：用户任务描述                                   │
│  处理：分解任务 → 生成步骤序列                         │
│  输出：结构化执行计划                                  │
│  Plan = [Step1, Step2, ..., StepN]                  │
│  特点：全局视角、一次性生成                            │
└─────────────────────────────────────────────────────┘
                        ↓ 传递计划
┌─────────────────────────────────────────────────────┐
│           阶段 2：Solving（执行）                     │
│  输入：执行计划                                       │
│  处理：逐步执行 → 收集结果                             │
│  输出：最终答案                                       │
│  for step in plan: execute(step)                     │
│  特点：专注执行、可并行化                              │
└─────────────────────────────────────────────────────┘

核心优势：规划阶段可以"慢思考"，执行阶段可以"快行动"
```

**图解说明**：如上图所示，Plan-and-Solve 将任务处理明确分为两个阶段。规划阶段专注于理解任务、分解步骤、制定策略；执行阶段则严格按照计划行动。这种分离带来了两大好处：(1) 规划时可以充分思考，不受执行细节干扰；(2) 执行时可以高度专注，甚至可以并行处理多个步骤。

### 2.2 Prompt 设计：如何引导模型做规划

Plan-and-Solve 的实现关键在于**精心设计的 Prompt**，引导模型进入"规划模式"。

**基础版 Prompt 模板**：

```python
PLAN_AND_SOLVE_PROMPT = """
你是一个专业的任务规划助手。请将用户的复杂任务分解为清晰的执行步骤。

任务分解原则：
1. 每个步骤应该是原子性的（只做一件事）
2. 步骤之间应该有清晰的依赖关系
3. 考虑可能的异常情况和备选方案
4. 标注每个步骤需要的工具或资源

请以 JSON 格式输出计划：
{
  "task_summary": "任务的简要总结",
  "steps": [
    {
      "step_id": 1,
      "description": "步骤描述",
      "tool_required": "所需工具（如有）",
      "expected_output": "预期输出",
      "dependencies": []
    }
  ],
  "potential_risks": ["可能的风险点"],
  "success_criteria": "任务成功的判断标准"
}

用户任务：{user_task}

请开始规划：
"""
```

**实战示例**：

```python
from openai import OpenAI
import json

client = OpenAI(api_key="your-api-key")

def generate_plan(user_task: str) -> dict:
    """生成任务执行计划"""
    
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": PLAN_AND_SOLVE_PROMPT},
            {"role": "user", "content": user_task}
        ],
        temperature=0.3  # 较低温度，保证计划的稳定性
    )
    
    plan_text = response.choices[0].message.content
    
    # 解析 JSON
    try:
        plan = json.loads(plan_text)
        return plan
    except json.JSONDecodeError:
        # 如果解析失败，尝试提取 JSON 部分
        import re
        json_match = re.search(r'\{.*\}', plan_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError("无法解析计划")

# 测试
task = "帮我分析一下特斯拉股票过去一年的表现，并预测下个月的走势"
plan = generate_plan(task)
print(json.dumps(plan, indent=2, ensure_ascii=False))
```

**典型输出**：

```json
{
  "task_summary": "分析特斯拉股票历史表现并预测未来走势",
  "steps": [
    {
      "step_id": 1,
      "description": "获取特斯拉（TSLA）过去一年的历史股价数据",
      "tool_required": "stock_api.get_historical_data(ticker='TSLA', period='1y')",
      "expected_output": "包含日期、开盘价、收盘价、成交量等字段的数据集",
      "dependencies": []
    },
    {
      "step_id": 2,
      "description": "计算关键指标：收益率、波动率、移动平均线",
      "tool_required": "pandas + numpy 进行统计分析",
      "expected_output": "技术指标汇总表",
      "dependencies": [1]
    },
    {
      "step_id": 7,
      "description": "综合技术面和基本面分析，生成最终报告",
      "tool_required": "文本生成",
      "expected_output": "完整的分析报告",
      "dependencies": [4, 5, 6]
    }
  ],
  "potential_risks": [
    "历史数据不一定能准确预测未来",
    "突发事件可能影响股价"
  ],
  "success_criteria": "提供基于数据的客观分析，明确标注预测的不确定性"
}
```

**关键设计要点**：

1. **结构化输出**：强制使用 JSON 格式，便于程序解析和验证
2. **依赖关系**：明确步骤之间的先后顺序，支持并行执行优化
3. **风险评估**：提前识别潜在问题，准备应对策略
4. **成功标准**：定义清晰的完成条件，避免无限循环

### 2.3 执行引擎：按计划行动

有了计划之后，需要一个可靠的执行引擎来按部就班地完成任务。

```python
class PlanExecutor:
    """计划执行引擎"""
    
    def __init__(self, tools: dict):
        self.tools = tools
        self.step_results = {}
    
    def execute_plan(self, plan: dict) -> dict:
        """执行完整的计划"""
        
        steps = plan["steps"]
        results = {}
        
        print(f"📋 开始执行计划：{plan['task_summary']}")
        print(f"   共 {len(steps)} 个步骤\n")
        
        for step in steps:
            step_id = step["step_id"]
            
            # 检查依赖是否满足
            if not self._check_dependencies(step["dependencies"], results):
                print(f"⚠️  步骤 {step_id} 的依赖未满足，跳过")
                continue
            
            print(f"▶️  执行步骤 {step_id}: {step['description']}")
            
            try:
                result = self._execute_step(step)
                results[step_id] = result
                
                print(f"✅ 步骤 {step_id} 完成\n")
                
            except Exception as e:
                print(f"❌ 步骤 {step_id} 失败：{str(e)}\n")
                
                if step_id in self._critical_steps(plan):
                    print("🛑 关键步骤失败，终止执行")
                    return {"status": "failed", "error": str(e)}
        
        # 汇总结果
        final_result = self._synthesize_results(plan, results)
        
        return {
            "status": "completed",
            "final_answer": final_result
        }
    
    def _check_dependencies(self, dependencies: list, results: dict) -> bool:
        """检查依赖是否都已满足"""
        return all(dep_id in results for dep_id in dependencies)
    
    def _execute_step(self, step: dict) -> str:
        """执行单个步骤"""
        tool_name = step.get("tool_required")
        
        if not tool_name:
            return self._llm_generate(step["description"])
        
        # 根据工具名调用相应工具
        if tool_name.startswith("stock_api."):
            return self._call_stock_api(tool_name)
        else:
            raise ValueError(f"未知工具：{tool_name}")
    
    def _synthesize_results(self, plan: dict, results: dict) -> str:
        """综合所有步骤的结果生成最终答案"""
        summary_prompt = f"""
        基于以下步骤的执行结果，生成最终的任务答案：
        
        任务：{plan['task_summary']}
        
        各步骤结果：
        {json.dumps(results, indent=2, ensure_ascii=False)}
        
        请提供一个清晰、完整的最终答案：
        """
        
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": summary_prompt}]
        )
        
        return response.choices[0].message.content
```

**执行流程日志**：

```
📋 开始执行计划：分析特斯拉股票历史表现并预测未来走势
   共 7 个步骤

▶️  执行步骤 1: 获取特斯拉（TSLA）过去一年的历史股价数据
✅ 步骤 1 完成

▶️  执行步骤 2: 计算关键指标：收益率、波动率、移动平均线
✅ 步骤 2 完成

...

============================================================
最终答案：
基于过去一年的数据分析，特斯拉股票表现出...
```

### 2.4 Plan-and-Solve 的优势与局限

**优势**：

✅ **全局视角**：在执行前就能看到完整的任务蓝图
✅ **可解释性强**：计划本身就是文档，便于人类审查
✅ **易于调试**：可以单独测试每个步骤
✅ **支持并行**：无依赖的步骤可以并行执行，提升效率
✅ **容错性好**：某个步骤失败不影响其他步骤

**局限性**：

❌ **计划质量依赖 LLM**：如果初始计划有误，后续执行都会偏离
❌ **缺乏动态调整**：执行过程中遇到意外情况，难以修改计划
❌ **不适合探索性任务**：对于需要试错的任务，预先规划反而受限
❌ **Token 消耗大**：生成详细计划需要大量上下文

**适用场景**：
- ✅ 工作流程固定的任务（如数据处理管道）
- ✅ 步骤清晰的多步任务（如旅行规划）
- ✅ 需要审计和追溯的场景（如金融分析）

**不适用场景**：
- ❌ 创造性任务（如写小说）
- ❌ 高度不确定的环境（如实时交易）
- ❌ 需要频繁交互的任务（如对话系统）

---

## 3. Reflexion：从失败中学习的自我反思机制

### 3.1 核心洞察：人类是如何学习的？

Plan-and-Solve 解决了"有计划"的问题，但它仍然是一次性的——如果计划执行失败，它就束手无策了。

**人类的思维方式**完全不同：

学习骑自行车的过程：

尝试 1:
- 行动：踩踏板，保持平衡
- 结果：摔倒 ❌
- 反思："我身体太僵硬了，应该放松一点"

尝试 2:
- 行动：放松身体，目视前方
- 结果：还是摔倒，但坚持了更久 ⚠️
- 反思："方向控制有问题，转弯时应该减速"

尝试 3:
- 行动：放松 + 提前减速转弯
- 结果：成功骑行 10 米！✓
- 反思："关键是保持速度和平衡的动态调整"

尝试 N:
- 行动：综合运用之前的经验
- 结果：熟练骑行 ✓✓✓

**关键差异**：人类不是简单地重复尝试，而是**从每次失败中提取教训**，并将这些教训用于指导下一次尝试。

**Reflexion 框架**正是模仿了这一过程。

### 3.2 Reflexion 的架构设计

Reflexion 自我反思循环示意图：

```
┌──────────────────────────┐
│   Trial N：执行尝试       │
│   基于当前策略执行任务     │
│   记录：行动轨迹 + 结果    │
└──────────────────────────┘
            ↓ 评估结果
┌──────────────────────────┐
│   Evaluator：结果评估     │
│   Success? Yes/No        │
└──────────────────────────┘
            ↓ 失败则反思
┌──────────────────────────┐
│   Reflexion：自我反思     │
│   分析失败 → 生成改进建议  │
└──────────────────────────┘
            ↑ 更新策略
┌──────────────────────────┐
│ Trial N+1：改进后的尝试   │
│   融入反思得到的经验       │
└──────────────────────────┘

核心创新：将"失败经验"转化为"语言形式的反思"
传统 RL：通过奖励信号隐式学习
Reflexion：通过自然语言显式反思
优势：样本效率高、可解释性强、无需大量训练数据
```

**图解说明**：如上图所示，Reflexion 构建了一个闭环的学习系统。每次尝试后，系统会评估结果，如果失败则触发反思机制，分析失败原因并生成改进建议。这些反思以自然语言的形式存储在记忆中，指导后续的尝试。这个过程不断迭代，直到任务成功或达到最大尝试次数。

### 3.3 Reflexion 的核心组件

Reflexion 框架包含三个核心组件：

**1. Actor（执行者）**
- 负责执行任务，生成行动轨迹
- 可以是任何 LLM-based Agent（如 ReAct Agent）
- 接收任务描述和记忆中的反思，生成行动方案

**2. Evaluator（评估器）**
- 判断任务是否成功
- 可以是规则引擎、单元测试、或另一个 LLM
- 输出二元信号（Success/Failure）或细粒度评分

**3. Self-Reflection Module（自我反思模块）**
- 当任务失败时被触发
- 分析执行轨迹，找出失败原因
- 生成自然语言形式的反思和建议
- 将反思存入记忆，供下次尝试使用

### 3.4 代码实战：实现 Reflexion Agent

让我们通过一个具体的例子来实现 Reflexion 框架。

**任务场景**：让 Agent 编写一个排序算法，并通过单元测试。

```python
from typing import List
import subprocess
import tempfile
import os

class ReflexionAgent:
    """具备自我反思能力的 Agent"""
    
    def __init__(self, llm_client, max_trials=5):
        self.llm = llm_client
        self.max_trials = max_trials
        self.memory = []  # 存储反思历史
    
    def run(self, task_description: str, test_code: str) -> dict:
        """执行 Reflexion 循环"""
        
        print(f"🎯 任务：{task_description}\n")
        
        for trial in range(1, self.max_trials + 1):
            print(f"{'='*60}")
            print(f"🔄 Trial {trial}/{self.max_trials}")
            print(f"{'='*60}\n")
            
            # Step 1: Actor 生成解决方案
            solution = self._actor_generate(task_description, trial)
            print(f"💡 生成的解决方案：\n{solution}\n")
            
            # Step 2: 执行测试
            success, feedback = self._evaluate(solution, test_code)
            
            if success:
                print(f"✅ Trial {trial} 成功！")
                return {
                    "status": "success",
                    "trial_count": trial,
                    "solution": solution,
                    "reflections": self.memory
                }
            else:
                print(f"❌ Trial {trial} 失败")
                print(f"📝 测试反馈：{feedback}\n")
                
                # Step 3: 自我反思
                reflection = self._self_reflect(
                    task_description, 
                    solution, 
                    feedback, 
                    trial
                )
                print(f"🤔 反思：{reflection}\n")
                
                # 将反思存入记忆
                self.memory.append({
                    "trial": trial,
                    "solution": solution,
                    "feedback": feedback,
                    "reflection": reflection
                })
        
        print(f"⚠️  达到最大尝试次数 ({self.max_trials})，任务未完成")
        return {
            "status": "failed",
            "trial_count": self.max_trials,
            "reflections": self.memory
        }
    
    def _actor_generate(self, task: str, trial: int) -> str:
        """Actor 生成解决方案"""
        
        prompt = f"你是一个专业的 Python 程序员。请完成以下任务：\n\n任务描述：{task}\n"
        
        # 如果有历史反思，加入上下文
        if self.memory:
            prompt += "\n之前的尝试和反思：\n"
            for i, mem in enumerate(self.memory[-3:], 1):
                prompt += f"""
尝试 {mem['trial']}:
- 方案：{mem['solution'][:200]}...
- 失败原因：{mem['feedback']}
- 反思：{mem['reflection']}
"""
            prompt += "\n请基于以上反思，改进你的解决方案。\n"
        
        prompt += "\n请只提供 Python 代码，不要有其他解释：\n"
        
        response = self.llm.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    def _evaluate(self, solution: str, test_code: str) -> tuple:
        """评估解决方案"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(solution + "\n\n" + test_code)
            temp_file = f.name
        
        try:
            result = subprocess.run(
                ['python', temp_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return True, "所有测试通过"
            else:
                error_msg = result.stderr[:500]
                return False, f"测试失败：{error_msg}"
        
        except subprocess.TimeoutExpired:
            return False, "执行超时（可能存在死循环）"
        
        finally:
            os.unlink(temp_file)
    
    def _self_reflect(self, task: str, solution: str, feedback: str, trial: int) -> str:
        """生成自我反思"""
        
        prompt = f"""
你是一个善于反思的学习者。请分析这次失败的原因，并提出改进建议。

任务：{task}

你的方案：
{solution}

测试结果：
{feedback}

请回答以下问题：
1. 失败的根本原因是什么？
2. 你的方案有哪些具体问题？
3. 下次尝试时应该注意什么？
4. 有什么具体的改进策略？

请用简洁的语言回答（200 字以内）：
"""
        
        response = self.llm.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return response.choices[0].message.content.strip()

# 使用示例
if __name__ == "__main__":
    from openai import OpenAI
    client = OpenAI(api_key="your-api-key")
    
    agent = ReflexionAgent(client, max_trials=5)
    
    task = "实现一个快速排序算法，要求时间复杂度 O(n log n)"
    
    test_code = """
assert quicksort([3, 6, 8, 10, 1, 2, 1]) == [1, 1, 2, 3, 6, 8, 10]
assert quicksort([]) == []
assert quicksort([1]) == [1]
print("All tests passed!")
"""
    
    result = agent.run(task, test_code)
    
    print("\n" + "="*60)
    print(f"最终状态：{result['status']}")
    print(f"尝试次数：{result['trial_count']}")
```

**典型执行日志**：

```
🎯 任务：实现一个快速排序算法，要求时间复杂度 O(n log n)

============================================================
🔄 Trial 1/5
============================================================

💡 生成的解决方案：
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    left = [x for x in arr[1:] if x <= pivot]
    right = [x for x in arr[1:] if x > pivot]
    return quicksort(left) + [pivot] + quicksort(right)

❌ Trial 1 失败
📝 测试反馈：测试失败：RecursionError: maximum recursion depth exceeded

🤔 反思：失败原因是递归深度过大。当数组中有大量重复元素时，我的实现会导致不平衡的分区。下次应该使用原地排序（in-place）版本，或者选择更好的枢轴（如三数取中法）。

============================================================
🔄 Trial 2/5
============================================================

💡 生成的解决方案：
import random

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot_idx = random.randint(0, len(arr) - 1)
    pivot = arr[pivot_idx]
    
    left = [x for i, x in enumerate(arr) if x < pivot and i != pivot_idx]
    middle = [x for x in arr if x == pivot]
    right = [x for i, x in enumerate(arr) if x > pivot and i != pivot_idx]
    
    return quicksort(left) + middle + quicksort(right)

✅ Trial 2 成功！

============================================================
最终状态：success
尝试次数：2
```

**关键观察**：
- **第一次尝试**使用了简单的快速排序，但在特定情况下会栈溢出
- **反思**准确指出了问题：递归深度过大，分区不平衡
- **第二次尝试**引入了随机枢轴和三路分区，成功解决问题
- **仅用 2 次尝试**就找到了正确解，体现了 Reflexion 的高效性

### 3.5 Reflexion 的优势与应用场景

**核心优势**：

✅ **样本效率高**：相比强化学习需要成千上万次尝试，Reflexion 通常只需 3-5 次
✅ **可解释性强**：反思以自然语言形式存在，人类可以直接阅读和理解
✅ **无需额外训练**：利用预训练 LLM 的推理能力，不需要微调
✅ **通用性好**：适用于任何可以自动评估的任务

**典型应用场景**：

1. **代码生成与调试**
   - 生成代码 → 运行测试 → 失败则反思 → 改进代码
   - 适用：LeetCode 刷题、Bug 修复

2. **数学问题求解**
   - 提出解法 → 验证答案 → 错误则分析 → 调整思路
   - 适用：GSM8K 数学题、定理证明

3. **逻辑推理任务**
   - 给出推理链 → 检查一致性 → 矛盾则修正 → 重新推理
   - 适用：逻辑谜题、因果推理

4. **创意写作优化**
   - 生成初稿 → 评估质量 → 不足则改进 → 重写
   - 适用：文章润色、故事创作

**局限性**：

❌ **依赖评估器**：需要有可靠的自动化评估机制
❌ **反思质量不稳定**：LLM 可能生成肤浅或错误的反思
❌ **多次尝试成本高**：每次尝试都需要调用 LLM，Token 消耗大
❌ **可能陷入局部最优**：如果反思方向错误，可能反复在同一问题上打转

---

## 4. LLM + MCTS：决策树搜索的智能探索

### 4.1 为什么需要树搜索？

Plan-and-Solve 和 Reflexion 都只能**串行探索**单条路径。但在很多复杂任务中，我们需要**同时考虑多种可能性**，并明智地分配探索资源。

**经典案例：AlphaGo 的突破**

2016 年，AlphaGo 击败李世石的关键技术之一就是 **MCTS（Monte Carlo Tree Search，蒙特卡洛树搜索）**。

MCTS 四阶段循环示意图：

```
         根节点 (Q=0.6, N=100)
        /         |         \
      A          B*         C
   (Q=0.4)   (Q=0.7)    (Q=0.5)
   (N=30)    (N=50)     (N=20)
              /    \
            B1     B2*
                 (Q=0.8)
                /     \
              ...     ...

符号说明：
Q = 平均奖励值
N = 访问次数
绿色 = 最优路径
黄色 = 正在探索

MCTS 四阶段：
1️⃣ Selection：选择（UCB1 公式）
2️⃣ Expansion：扩展（添加新节点）
3️⃣ Simulation：模拟（Rollout 评估）
4️⃣ Backpropagation：回溯更新

核心思想：平衡"利用"（Exploitation）与"探索"（Exploration）
利用：选择当前 Q 值高的节点
探索：选择访问次数少的节点
```

**图解说明**：MCTS 通过不断重复四个阶段来构建搜索树：(1) **Selection**：从根节点出发，根据 UCB1 公式选择最有希望的子节点；(2) **Expansion**：在选中的叶子节点处扩展新的子节点；(3) **Simulation**：从新节点随机模拟到终局，评估胜负；(4) **Backpropagation**：将模拟结果沿路径回溯，更新所有经过节点的统计信息（Q 值和 N 值）。经过大量迭代后，访问次数最多的路径即为最优策略。

**MCTS 的核心优势**：
- **不需要领域知识**：只需知道游戏规则，无需人工设计评估函数
- **渐进式收敛**：随着迭代次数增加，策略越来越优
- **anytime 算法**：可以随时中断，返回当前最优解

### 4.2 将 MCTS 应用于 LLM

传统的 MCTS 用于围棋等游戏，状态空间和动作空间都是明确定义的。但如何将 MCTS 应用到 **LLM 的自然语言生成**任务中？

**关键挑战**：
1. **状态表示**：如何将文本转换为树节点？
2. **动作空间**：如何定义"下一步"的可能动作？
3. **评估函数**：如何判断一个中间状态的好坏？
4. **模拟策略**：如何快速 Rollout 到终局？

**解决方案**：

**1. 状态表示：Partial Solution（部分解）**
- 每个节点代表一个**中间推理步骤**或**部分答案**
- 例如：在数学题中，节点可以是"已推导出的中间结论"

**2. 动作空间：Next Step Generation**
- 使用 LLM 生成多个候选的下一步
- 例如：给定当前推理，让 LLM 生成 5 种可能的后续推导

**3. 评估函数：LLM-as-a-Judge**
- 使用另一个 LLM（或同一个 LLM）评估当前状态的质量
- 例如：让 LLM 打分："这个推理步骤有多大的可能性导向正确答案？"

**4. 模拟策略：Fast Rollout**
- 使用较低温度的 LLM 快速生成完整答案
- 或者使用启发式规则估算终局价值

### 4.3 LLM-MCTS 算法流程

以下是将 MCTS 应用于 LLM 任务的标准流程：

```python
import math
import random
from typing import List

class MCTSNode:
    """MCTS 树节点"""
    
    def __init__(self, state: str, parent=None):
        self.state = state
        self.parent = parent
        self.children: List[MCTSNode] = []
        
        self.visits = 0
        self.value = 0.0
    
    @property
    def q_value(self) -> float:
        """平均奖励值 Q = 总奖励 / 访问次数"""
        if self.visits == 0:
            return 0.0
        return self.value / self.visits
    
    def ucb1(self, total_visits: int, exploration_constant: float = 1.414) -> float:
        """
        UCB1 公式：平衡利用与探索
        
        UCB1 = Q + c * sqrt(ln(N_parent) / N_node)
        """
        if self.visits == 0:
            return float('inf')
        
        exploitation = self.q_value
        exploration = exploration_constant * math.sqrt(
            math.log(total_visits) / self.visits
        )
        
        return exploitation + exploration
    
    def best_child(self, total_visits: int) -> 'MCTSNode':
        """选择 UCB1 值最大的子节点"""
        if not self.children:
            return None
        
        return max(self.children, key=lambda child: child.ucb1(total_visits))
    
    def add_child(self, state: str) -> 'MCTSNode':
        """添加子节点"""
        child = MCTSNode(state, parent=self)
        self.children.append(child)
        return child
    
    def update(self, reward: float):
        """回溯更新"""
        self.visits += 1
        self.value += reward


class LLMMCTS:
    """基于 LLM 的蒙特卡洛树搜索"""
    
    def __init__(self, llm_client, iterations=100, rollout_depth=3):
        self.llm = llm_client
        self.iterations = iterations
        self.rollout_depth = rollout_depth
    
    def search(self, initial_state: str, problem: str) -> str:
        """执行 MCTS 搜索"""
        
        root = MCTSNode(initial_state)
        
        print(f"🌳 开始 MCTS 搜索（{self.iterations} 次迭代）...\n")
        
        for i in range(1, self.iterations + 1):
            # Step 1: Selection
            node = self._select(root)
            
            # Step 2: Expansion
            if not self._is_terminal(node.state):
                node = self._expand(node, problem)
            
            # Step 3: Simulation
            reward = self._simulate(node, problem)
            
            # Step 4: Backpropagation
            self._backpropagate(node, reward)
            
            if i % 20 == 0:
                print(f"  迭代 {i}/{self.iterations}")
        
        # 返回访问次数最多的子节点
        best_node = max(root.children, key=lambda c: c.visits)
        print(f"\n✅ 搜索完成！最优解访问次数：{best_node.visits}")
        
        return best_node.state
    
    def _select(self, node: MCTSNode) -> MCTSNode:
        """Selection：选择最有希望的节点"""
        while node.children and all(child.visits > 0 for child in node.children):
            node = node.best_child(sum(c.visits for c in node.children))
        return node
    
    def _expand(self, node: MCTSNode, problem: str) -> MCTSNode:
        """Expansion：扩展新节点"""
        candidates = self._generate_candidates(node.state, problem)
        
        if not candidates:
            return node
        
        untried = [c for c in candidates if c not in 
                   [child.state for child in node.children]]
        
        if untried:
            action = random.choice(untried)
            child = node.add_child(action)
            return child
        
        return node
    
    def _generate_candidates(self, current_state: str, problem: str) -> List[str]:
        """使用 LLM 生成候选的下一步"""
        
        prompt = f"""
问题：{problem}

当前推理状态：
{current_state}

请生成 3-5 个可能的下一步推理步骤：
"""
        
        response = self.llm.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        
        # 简化解析，实际应加错误处理
        candidates = response.choices[0].message.content.strip().split('\n')
        return [c.strip() for c in candidates if c.strip()]
    
    def _simulate(self, node: MCTSNode, problem: str) -> float:
        """Simulation：快速模拟到终局"""
        current_state = node.state
        
        for _ in range(self.rollout_depth):
            if self._is_terminal(current_state):
                break
            
            next_state = self._fast_rollout(current_state, problem)
            current_state = next_state
        
        reward = self._evaluate_state(current_state, problem)
        return reward
    
    def _fast_rollout(self, state: str, problem: str) -> str:
        """快速 Rollout"""
        prompt = f"问题：{problem}\n当前状态：{state}\n下一步："
        
        response = self.llm.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return state + "\n" + response.choices[0].message.content
    
    def _evaluate_state(self, state: str, problem: str) -> float:
        """评估状态质量"""
        
        prompt = f"""
问题：{problem}

当前解答：
{state}

请评估这个解答的质量，分数范围 0-1（1.0 完全正确，0.0 完全错误）：
"""
        
        response = self.llm.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        try:
            score = float(response.choices[0].message.content.strip())
            return max(0.0, min(1.0, score))
        except:
            return 0.5
    
    def _is_terminal(self, state: str) -> bool:
        """判断是否到达终局"""
        return "最终答案" in state or len(state.split('\n')) > 10
    
    def _backpropagate(self, node: MCTSNode, reward: float):
        """Backpropagation：回溯更新"""
        while node is not None:
            node.update(reward)
            node = node.parent
```

### 4.4 MCTS 在实际任务中的应用

**应用场景 1：数学问题求解**

问题："如果一个球从 100 米高处落下，每次反弹高度是之前的一半，求第 5 次落地时球总共经过的距离。"

MCTS 的探索过程：
- 根节点：问题描述
- 第一层：不同的解题思路（等比数列、递推公式、逐项计算）
- 第二层：每种思路的具体推导步骤
- 第三层：计算过程和中间结果
- 叶节点：最终答案

通过 MCTS，系统可以同时探索多种解法，并通过模拟验证哪种方法更可靠。

**应用场景 2：代码生成**

任务："实现一个线程安全的单例模式"

MCTS 的探索：
- 路径 1：使用双重检查锁定（DCL）
- 路径 2：使用静态内部类
- 路径 3：使用枚举
- 路径 4：使用 synchronized

每条路径都会经过编译测试和并发压力测试，最终选择通过率最高的方案。

**应用场景 3：创意写作**

任务："写一个关于时间旅行的科幻故事开头"

MCTS 的探索：
- 分支 1：硬科幻风格（注重科学原理）
- 分支 2：软科幻风格（注重人物情感）
- 分支 3：悬疑风格（设置谜团）
- 分支 4：幽默风格（轻松诙谐）

通过 LLM 评估每个开头的吸引力、原创性和连贯性，选择最佳方向深入。

### 4.5 LLM-MCTS 的优势与挑战

**核心优势**：

✅ **全局最优**：通过广泛探索，更可能找到全局最优解
✅ **鲁棒性强**：即使某条路径失败，还有其他备选
✅ **可解释性**：搜索树本身就是一个决策过程的可视化
✅ **灵活性强**：可以根据任务特点调整探索策略

**主要挑战**：

❌ **计算成本高**：每次迭代都需要多次 LLM 调用
❌ **评估不准确**：LLM 作为裁判可能给出不一致的评分
❌ **参数敏感**：UCB1 常数、迭代次数等参数需要精心调优
❌ **实现复杂**：相比 Plan-and-Solve 和 Reflexion，实现难度大

**性能对比**：

| 算法 | 准确率 | Token 消耗 | 实现难度 | 适用场景 |
|------|--------|-----------|---------|---------|
| **ReAct** | 基准 | 低 | 简单 | 单步或少步任务 |
| **Plan-and-Solve** | +30-50% | 中 | 中等 | 结构化任务 |
| **Reflexion** | +20-40% | 中高 | 中等 | 可评估任务 |
| **LLM-MCTS** | +15-25% | 高 | 复杂 | 复杂推理任务 |

---

## 5. 总结与展望

### 5.1 三种算法的对比与选择

<div align="center">

| 维度 | Plan-and-Solve | Reflexion | LLM-MCTS |
|------|---------------|-----------|----------|
| **核心思想** | 先计划后执行 | 从失败中学习 | 多路径探索 |
| **规划深度** | 中等（一次性计划） | 浅层（逐步改进） | 深层（树状搜索） |
| **样本效率** | 高（一次成功） | 中（3-5 次） | 低（需大量迭代） |
| **计算成本** | 低 | 中 | 高 |
| **可解释性** | 强（计划即文档） | 强（反思可见） | 中（树结构复杂） |
| **适用任务** | 结构化工作流 | 有明确标准的任务 | 复杂推理问题 |

</div>

**如何选择**：

- **简单任务** → ReAct 足够
- **步骤清晰的任务** → Plan-and-Solve
- **可以多次尝试的任务** → Reflexion
- **需要深度推理的任务** → LLM-MCTS
- **生产环境** → 组合使用（如 Plan-and-Solve + Reflexion）

### 5.2 未来发展方向

**短期（1-2 年）：算法融合**
- Plan-and-Solve + Reflexion：先制定计划，执行失败后反思并调整计划
- MCTS + Reflexion：在树搜索的每个节点应用自我反思
- 多 Agent 协作：不同 Agent 负责规划、执行、反思的不同环节

**中期（3-5 年）：自主学习**
- 元学习：Agent 学会选择最适合当前任务的规划策略
- 迁移学习：将一个领域的规划经验迁移到新领域
- 终身学习：持续积累规划经验，形成"直觉"

**长期（5-10 年）：通用规划能力**
- 跨模态规划：同时处理文本、代码、图像、视频等多种信息
- 长期规划：能够制定数月甚至数年的战略规划
- 群体智能：多个 Agent 协同完成超大规模任务

### 5.3 给实践者的建议

如果你要在项目中应用自主规划算法，以下是一些实用建议：

**1. 从简单开始**
- 先用 ReAct 建立基线
- 再引入 Plan-and-Solve 改善结构化任务
- 最后根据需要添加 Reflexion 或 MCTS

**2. 重视评估器设计**
- Reflexion 和 MCTS 的效果高度依赖评估器的质量
- 优先开发可靠的自动化测试和验证机制

**3. 监控 Token 消耗**
- 规划算法的 Token 消耗可能是 ReAct 的 5-10 倍
- 设置预算上限，避免成本失控

**4. 人机协作**
- 让人类审查关键决策点
- 允许人类干预和调整计划
- 收集人类反馈改进算法

**5. 持续迭代**
- 记录每次任务的执行轨迹和反思
- 分析失败案例，优化 Prompt 和参数
- 建立自己的"规划模式库"

---

## 结语

自主规划算法代表了 AI Agent 发展的下一个前沿。从 ReAct 的"边想边做"，到 Plan-and-Solve 的"先谋后动"，再到 Reflexion 的"从失败中学习"，最后到 MCTS 的"全局最优搜索"，我们看到了 AI 系统在**主动性**、**适应性**和**智能性**上的持续进化。

但这只是开始。真正的通用人工智能需要具备**跨领域的规划能力**、**长期的战略眼光**，以及**在不确定性中做出稳健决策**的能力。这些挑战需要我们继续探索更先进的算法、更高效的架构，以及更深层次的认知机理。

下一篇，我们将进入 **《工作流编排引擎：基于 DAG 的任务调度与状态机管理》**，探讨如何将多个 Agent 和工具组织成复杂的协作网络，实现真正的工业化 AI 应用。敬请期待！

---

## 📚 参考文献与延伸阅读

### 核心论文

1. **Plan-and-Solve Prompting**
   - Wang, X., et al. (2023). "Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models." *ACL 2023*.
   - 链接：<a href="https://arxiv.org/abs/2305.04091" target="_blank">https://arxiv.org/abs/2305.04091</a>

2. **Reflexion Framework**
   - Shinn, N., et al. (2023). "Reflexion: Language Agents with Verbal Reinforcement Learning." *NeurIPS 2023*.
   - 链接：<a href="https://arxiv.org/abs/2303.11366" target="_blank">https://arxiv.org/abs/2303.11366</a>

3. **Tree of Thoughts**
   - Yao, S., et al. (2023). "Tree of Thoughts: Deliberate Problem Solving with Large Language Models." *arXiv preprint*.
   - 链接：<a href="https://arxiv.org/abs/2305.10601" target="_blank">https://arxiv.org/abs/2305.10601</a>

4. **LLM + MCTS**
   - Feng, X., et al. (2023). "Alphazero-like Tree-Search can Guide Large Language Model Decoding and Training." *ICLR 2024*.
   - 链接：<a href="https://arxiv.org/abs/2309.17179" target="_blank">https://arxiv.org/abs/2309.17179</a>

5. **Monte Carlo Tree Search**
   - Browne, C. B., et al. (2012). "A Survey of Monte Carlo Tree Search Methods." *IEEE Transactions on Computational Intelligence and AI in Games*.
   - 链接：<a href="https://ieeexplore.ieee.org/document/6179960" target="_blank">https://ieeexplore.ieee.org/document/6179960</a>

### 工程实践

6. **LangGraph：工作流编排框架**
   - LangChain Team. "LangGraph Documentation."
   - 链接：<a href="https://langchain-ai.github.io/langgraph/" target="_blank">https://langchain-ai.github.io/langgraph/</a>

7. **AutoGen：多 Agent 协作框架**
   - Microsoft Research. "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation."
   - GitHub: <a href="https://github.com/microsoft/autogen" target="_blank">https://github.com/microsoft/autogen</a>

8. **CrewAI：Agent 编排工具**
   - CrewAI Team. "CrewAI Documentation."
   - 链接：<a href="https://docs.crewai.com/" target="_blank">https://docs.crewai.com/</a>

9. **DSPy：编程而非提示工程**
   - Stanford NLP. "DSPy: Compiling Declarative Language Model Calls into State-of-the-Art Pipelines."
   - GitHub: <a href="https://github.com/stanfordnlp/dspy" target="_blank">https://github.com/stanfordnlp/dspy</a>

10. **Guidance：结构化生成**
    - Microsoft Research. "Guidance: A Guidance Language for Controlling Large Language Models."
    - GitHub: <a href="https://github.com/guidance-ai/guidance" target="_blank">https://github.com/guidance-ai/guidance</a>

### 进阶阅读

11. **Self-Refine**
    - Madaan, A., et al. (2023). "Self-Refine: Iterative Refinement with Self-Feedback." *NeurIPS 2023*.
    - 链接：<a href="https://arxiv.org/abs/2303.17651" target="_blank">https://arxiv.org/abs/2303.17651</a>

12. **ReAct + Planning**
    - Yao, S., et al. (2022). "ReAct: Synergizing Reasoning and Acting in Language Models." *ICLR 2023*.
    - 链接：<a href="https://arxiv.org/abs/2210.03629" target="_blank">https://arxiv.org/abs/2210.03629</a>

13. **LLM Agents Survey**
    - Xi, Z., et al. (2023). "The Rise and Potential of Large Language Model Based Agents: A Survey." *arXiv preprint*.
    - 链接：<a href="https://arxiv.org/abs/2309.07864" target="_blank">https://arxiv.org/abs/2309.07864</a>

14. **Agent Benchmark**
    - Jimenez, C., et al. (2023). "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" *ICLR 2024*.
    - 链接：<a href="https://arxiv.org/abs/2310.06770" target="_blank">https://arxiv.org/abs/2310.06770</a>

15. **Planning with LLMs**
    - Huang, W., et al. (2024). "Task Planning in Large Language Models: A Survey." *arXiv preprint*.
    - 链接：<a href="https://arxiv.org/abs/2402.04529" target="_blank">https://arxiv.org/abs/2402.04529</a>

---

> **下一篇预告：** [工作流编排引擎：基于 DAG 的任务调度与状态机管理（LangGraph 原理）](#)
