---
title: "AI 技术演进与核心算法实战 | 第二十二篇：多步任务容错：自动重试、回滚机制与异常处理策略设计"
excerpt: "构建生产级 AI Agent 的最后一块拼图。深入探讨多步任务中的容错架构设计，详解指数退避重试、状态快照回滚、降级策略与补偿事务等核心技术，并通过完整代码实现一个具备工业级可靠性的 Agent 执行引擎。"
description: "AI 技术演进与核心算法实战第二十二篇：多步任务容错：自动重试、回滚机制与异常处理策略设计"
keyword: "AI,大模型,Agent,容错,重试机制,回滚,异常处理,降级策略,补偿事务,生产环境,可靠性工程"
tag: "AI"
date: "2026-03-20 10:00:00"
coverImage: "/assets/posts/AI-技术演进与核心算法实战 - 第二十二篇：多步任务容错：自动重试、回滚机制与异常处理策略设计/assets/cover/fault-tolerance-cover.svg"
author:
  name: 蛋烘糕
  picture: "/assets/posts/AI-技术演进与核心算法实战 - 第二十二篇：多步任务容错：自动重试、回滚机制与异常处理策略设计/assets/author/zhaohuan.jpg"
ogImage:
  url: "/assets/posts/AI-技术演进与核心算法实战 - 第二十二篇：多步任务容错：自动重试、回滚机制与异常处理策略设计/assets/cover/fault-tolerance-cover.svg"
---

> **在分布式系统中，失败不是异常，而是常态。真正的智能不仅体现在成功时的优雅，更体现在失败时的韧性。**

在前几篇文章中，我们构建了能够自主规划（Plan-and-Solve）、自我反思（Reflexion）并编排复杂工作流（DAG）的 AI Agent。但当我们把这些 Agent 部署到**真实的生产环境**时，会遭遇一个残酷的现实：**一切都会出错**。

- LLM API 可能超时或返回 503 错误
- 外部工具（数据库、API）可能暂时不可用
- 网络抖动可能导致请求丢失
- 模型可能产生幻觉输出无效的工具调用参数
- 长时间运行的任务可能在中途被中断

如果我们的 Agent 在这些情况下直接崩溃，那它永远无法成为可靠的生产系统。**容错能力（Fault Tolerance）** 是区分"玩具 Demo"和"工业级系统"的分水岭。

本篇是 **《AI 技术演进与核心算法实战》第四模块：行动篇** 的收官之作。我们将深入探讨多步任务中的容错架构设计，涵盖：
1. **智能重试策略**：指数退避、抖动算法与熔断机制
2. **状态管理与回滚**：检查点（Checkpointing）、快照恢复与事务补偿
3. **降级与兜底策略**：优雅降级、备用模型切换与人机协同
4. **完整的容错引擎实现**：手写一个具备工业级可靠性的 Agent 执行框架

## 1. 为什么多步任务的容错如此困难？

在传统的单体应用中，错误处理相对简单：捕获异常 → 记录日志 → 返回错误码。但在 AI Agent 的多步执行流程中，情况变得极其复杂。

### 1.1 多步任务的特殊性

让我们看一个典型的复杂 Agent 任务：

```python
# 用户请求："分析公司 Q3 财报，生成可视化图表，撰写分析报告并发送给 CEO"

执行步骤：
Step 1: 从数据库提取 Q3 财务数据 (SQL Query)
Step 2: 数据清洗与异常值检测 (Python Code Execution)
Step 3: 调用 LLM 分析数据趋势 (LLM API Call)
Step 4: 生成可视化图表 (Matplotlib/Chart Generation)
Step 5: 撰写分析报告 (LLM API Call)
Step 6: 发送邮件给 CEO (Email API)
```

**潜在故障点分析：**

| 步骤 | 可能的失败原因 | 失败类型 | 影响范围 |
|------|--------------|---------|---------|
| Step 1 | 数据库连接超时、查询语法错误 | 临时性/永久性 | 阻塞后续所有步骤 |
| Step 2 | 代码执行沙箱资源不足、依赖缺失 | 临时性/配置错误 | 需要重新执行 Step 2 |
| Step 3 | LLM API 限流、返回格式错误 | 临时性/模型错误 | 可能需要重试或切换模型 |
| Step 4 | 内存溢出、图表库版本冲突 | 环境错误 | 需要隔离执行环境 |
| Step 5 | LLM 生成长文本超时 | 临时性 | 可分段生成或降级为摘要 |
| Step 6 | 邮件服务器不可达、收件人地址无效 | 临时性/永久错误 | 需要通知管理员 |

### 1.2 传统错误处理的局限性

**问题 1：简单的 try-catch 无法解决状态不一致**

```python
# ❌ 错误的做法：没有状态管理
try:
    data = fetch_financial_data()
    analysis = llm_analyze(data)
    report = generate_report(analysis)
    send_email(report)
except Exception as e:
    log_error(e)
    return "Task failed"  # 用户不知道执行到哪一步了，也无法恢复
```

如果 `generate_report()` 失败，我们已经：
- ✅ 完成了数据提取（浪费了数据库资源）
- ✅ 完成了数据分析（浪费了 LLM Token）
- ❌ 报告生成失败

此时简单的重试会**重复执行所有步骤**，造成资源浪费和成本飙升。

**问题 2：无法区分临时性错误和永久性错误**

```python
# ❌ 盲目重试：对永久性错误无效且浪费时间
for i in range(3):
    try:
        result = call_llm_api(prompt)
        break
    except Exception:
        continue  # 如果是"参数格式错误"这种永久性错误，重试 100 次也没用
```

**问题 3：缺乏优雅的降级方案**

当主流程失败时，系统是直接崩溃，还是能提供部分可用的结果？例如：
- LLM 分析失败 → 能否返回原始数据让用户自行判断？
- 邮件发送失败 → 能否保存报告到本地并通知用户手动发送？

### 1.3 容错设计的核心原则

基于上述挑战，我们需要建立一套系统的容错架构，遵循以下原则：

1. **快速失败（Fail Fast）**：尽早检测并拒绝明显的错误输入，避免浪费资源
2. **智能重试（Smart Retry）**：只对临时性错误重试，并采用合理的退避策略
3. **状态持久化（State Persistence）**：定期保存执行进度，支持断点续传
4. **优雅降级（Graceful Degradation）**：在主流程失败时提供备选方案
5. **可观测性（Observability）**：完整记录执行轨迹，便于调试和优化

接下来，我们将逐一实现这些策略。

## 2. 智能重试策略：从暴力重试到指数退避

重试是最直接的容错手段，但"如何重试"比"是否重试"更重要。

### 2.1 识别可重试错误

首先，我们需要建立一个错误分类体系，区分哪些错误值得重试：

```python
from enum import Enum
from typing import Optional

class ErrorType(Enum):
    TRANSIENT = "transient"      # 临时性错误：网络抖动、服务过载
    PERMANENT = "permanent"      # 永久性错误：参数错误、权限不足
    RATE_LIMIT = "rate_limit"    # 限流错误：需要等待后重试
    TIMEOUT = "timeout"          # 超时错误：可能需要增加超时时间或重试

def classify_error(exception: Exception) -> ErrorType:
    """根据异常类型判断是否可重试"""
    error_msg = str(exception).lower()
    
    # 临时性错误（可重试）
    if any(keyword in error_msg for keyword in [
        "timeout", "connection reset", "service unavailable", 
        "503", "502", "network error"
    ]):
        return ErrorType.TRANSIENT
    
    # 限流错误（可重试，但需要特殊处理）
    if "rate limit" in error_msg or "429" in error_msg:
        return ErrorType.RATE_LIMIT
    
    # 超时错误（可重试）
    if "timed out" in error_msg:
        return ErrorType.TIMEOUT
    
    # 永久性错误（不应重试）
    if any(keyword in error_msg for keyword in [
        "invalid parameter", "authentication failed", "404", 
        "permission denied", "syntax error"
    ]):
        return ErrorType.PERMANENT
    
    # 默认为临时性错误（保守策略）
    return ErrorType.TRANSIENT
```

### 2.2 指数退避算法（Exponential Backoff）

暴力重试（固定间隔）会导致"重试风暴"，加剧服务端压力。业界标准做法是使用**指数退避 + 随机抖动**。

**核心公式：**
```
wait_time = min(base_delay * (2 ^ attempt_number) + random_jitter, max_delay)
```

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 370" width="100%" height="100%" style="max-width: 720px; margin: 20px 0;" shape-rendering="crispEdges" text-rendering="crispEdges">
    <defs>
      <style>
        .axis { stroke: #334155; stroke-width: 3; }
        .line-exponential { fill: none; stroke: #dc2626; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
        .line-linear { fill: none; stroke: #6b7280; stroke-width: 4; stroke-dasharray: 10,6; stroke-linecap: round; }
        .point { fill: #dc2626; stroke: #fff; stroke-width: 2.5; }
        .text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 17px; fill: #000000; text-anchor: middle; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .label { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 22px; fill: #000000; font-weight: 700; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      </style>
    </defs>
    <!-- Background -->
    <rect width="720" height="370" fill="#fafafa"/>
    <!-- Grid lines -->
    <line x1="80" y1="50" x2="80" y2="280" class="axis"/>
    <line x1="80" y1="280" x2="670" y2="280" class="axis"/>
    <!-- Y-axis labels -->
    <text x="68" y="286" class="text" text-anchor="end" font-size="17" font-weight="600">0s</text>
    <text x="68" y="228" class="text" text-anchor="end" font-size="17" font-weight="600">15s</text>
    <text x="68" y="170" class="text" text-anchor="end" font-size="17" font-weight="600">30s</text>
    <text x="68" y="112" class="text" text-anchor="end" font-size="17" font-weight="600">45s</text>
    <text x="68" y="56" class="text" text-anchor="end" font-size="17" font-weight="600">60s</text>
    <!-- X-axis labels -->
    <text x="80" y="312" class="text" font-size="17" font-weight="600">Attempt 0</text>
    <text x="198" y="312" class="text" font-size="17" font-weight="600">Attempt 1</text>
    <text x="316" y="312" class="text" font-size="17" font-weight="600">Attempt 2</text>
    <text x="434" y="312" class="text" font-size="17" font-weight="600">Attempt 3</text>
    <text x="552" y="312" class="text" font-size="17" font-weight="600">Attempt 4</text>
    <text x="670" y="312" class="text" font-size="17" font-weight="600">Attempt 5</text>
    <!-- Exponential backoff line -->
    <polyline 
      points="80,280 198,260 316,222 434,164 552,106 670,50" 
      class="line-exponential"
    />
    <!-- Data points -->
    <circle cx="80" cy="280" r="6.5" class="point"/>
    <circle cx="198" cy="260" r="6.5" class="point"/>
    <circle cx="316" cy="222" r="6.5" class="point"/>
    <circle cx="434" cy="164" r="6.5" class="point"/>
    <circle cx="552" cy="106" r="6.5" class="point"/>
    <circle cx="670" cy="50" r="6.5" class="point"/>
    <!-- Linear retry line (for comparison) -->
    <line x1="80" y1="280" x2="670" y2="250" class="line-linear"/>
    <!-- Max delay line -->
    <line x1="80" y1="50" x2="670" y2="50" stroke="#15803d" stroke-width="4" stroke-dasharray="12,6"/>
    <text x="678" y="59" class="text" text-anchor="start" fill="#166534" font-size="17" font-weight="800">Max Delay (60s)</text>
    <!-- Legend -->
    <rect x="160" y="326" width="20" height="20" fill="#dc2626" rx="4"/>
    <text x="186" y="343" class="text" text-anchor="start" font-size="17" font-weight="700">指数退避</text>
    <line x1="282" y1="336" x2="302" y2="336" stroke="#6b7280" stroke-width="4" stroke-dasharray="10,6"/>
    <text x="308" y="343" class="text" text-anchor="start" font-size="17" font-weight="700">线性重试</text>
    <!-- Title -->
    <text x="370" y="34" class="label" text-anchor="middle">指数退避 vs 线性重试对比</text>
    <text x="370" y="364" class="text" text-anchor="middle" font-size="16" font-weight="600" fill="#1e293b">横轴：重试次数 | 纵轴：等待时间</text>
  </svg>
</div>

**代码实现：**

```python
import time
import random
from functools import wraps

def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True
):
    """
    装饰器：为函数添加带指数退避的重试逻辑
    
    参数:
        max_retries: 最大重试次数
        base_delay: 基础延迟时间（秒）
        max_delay: 最大延迟时间（秒）
        exponential_base: 指数基数（通常为 2）
        jitter: 是否添加随机抖动（避免重试风暴）
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                
                except Exception as e:
                    last_exception = e
                    error_type = classify_error(e)
                    
                    # 永久性错误不重试
                    if error_type == ErrorType.PERMANENT:
                        raise ValueError(f"Permanent error (not retryable): {e}")
                    
                    # 达到最大重试次数
                    if attempt >= max_retries:
                        break
                    
                    # 计算等待时间
                    if error_type == ErrorType.RATE_LIMIT:
                        # 限流错误：从响应头中提取 Retry-After
                        retry_after = getattr(e, 'retry_after', 5)
                        delay = min(retry_after, max_delay)
                    else:
                        # 指数退避
                        delay = min(
                            base_delay * (exponential_base ** attempt),
                            max_delay
                        )
                        
                        # 添加随机抖动（±25%）
                        if jitter:
                            jitter_range = delay * 0.25
                            delay += random.uniform(-jitter_range, jitter_range)
                    
                    print(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
                    print(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(max(0, delay))
            
            raise Exception(f"Failed after {max_retries} retries. Last error: {last_exception}")
        
        return wrapper
    return decorator

# 使用示例
@retry_with_backoff(max_retries=3, base_delay=1.0, max_delay=30.0)
def call_llm_api(prompt: str) -> str:
    """调用 LLM API（会自动重试）"""
    # 模拟 API 调用
    response = make_http_request("https://api.openai.com/v1/chat/completions", ...)
    return response.choices[0].message.content
```

### 2.3 熔断器模式（Circuit Breaker）

当某个服务持续失败时，继续重试只会浪费资源。**熔断器**会在失败率达到阈值时"跳闸"，暂时停止对该服务的调用，给系统恢复的时间。

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"       # 正常状态：允许请求通过
    OPEN = "open"           # 断开状态：拒绝请求，快速失败
    HALF_OPEN = "half_open" # 半开状态：允许少量试探性请求

class CircuitBreaker:
    """
    熔断器实现
    
    工作原理：
    1. CLOSED 状态：正常执行，记录失败次数
    2. 当失败次数超过阈值 → 切换到 OPEN 状态
    3. OPEN 状态：立即拒绝请求，等待冷却时间
    4. 冷却时间结束后 → 切换到 HALF_OPEN 状态
    5. HALF_OPEN 状态：允许一次试探请求
       - 成功 → 切换到 CLOSED（恢复正常）
       - 失败 → 切换回 OPEN（继续冷却）
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        expected_exception: type = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.success_count_in_half_open = 0
    
    def can_execute(self) -> bool:
        """判断是否允许执行请求"""
        if self.state == CircuitState.CLOSED:
            return True
        
        if self.state == CircuitState.OPEN:
            # 检查是否已过冷却时间
            if self.last_failure_time and \
               (time.time() - self.last_failure_time) > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                print("Circuit breaker: OPEN → HALF_OPEN (testing recovery)")
                return True
            return False
        
        # HALF_OPEN 状态：允许试探性请求
        return True
    
    def record_success(self):
        """记录成功"""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count_in_half_open += 1
            if self.success_count_in_half_open >= 3:  # 连续 3 次成功
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                self.success_count_in_half_open = 0
                print("Circuit breaker: HALF_OPEN → CLOSED (recovered)")
        elif self.state == CircuitState.CLOSED:
            # 在 CLOSED 状态下，成功会重置失败计数
            self.failure_count = 0
    
    def record_failure(self):
        """记录失败"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.state == CircuitState.HALF_OPEN:
            # 在半开状态下失败，立即回到断开状态
            self.state = CircuitState.OPEN
            print("Circuit breaker: HALF_OPEN → OPEN (recovery failed)")
        elif self.failure_count >= self.failure_threshold:
            # 失败次数超过阈值，跳闸
            self.state = CircuitState.OPEN
            print(f"Circuit breaker: CLOSED → OPEN (failures: {self.failure_count})")
    
    def execute(self, func, *args, **kwargs):
        """在熔断器保护下执行函数"""
        if not self.can_execute():
            raise Exception("Circuit breaker is OPEN. Request rejected.")
        
        try:
            result = func(*args, **kwargs)
            self.record_success()
            return result
        except self.expected_exception as e:
            self.record_failure()
            raise

# 使用示例
llm_circuit_breaker = CircuitBreaker(
    failure_threshold=5,      # 连续 5 次失败后跳闸
    recovery_timeout=60.0     # 冷却 60 秒后尝试恢复
)

def safe_call_llm(prompt: str) -> str:
    return llm_circuit_breaker.execute(call_llm_api, prompt)
```

**熔断器的价值：**
- ✅ **防止雪崩效应**：避免大量请求压垮已故障的服务
- ✅ **快速失败**：在服务不可用时立即返回错误，而不是等待超时
- ✅ **自动恢复**：定期探测服务是否恢复，无需人工干预

## 3. 状态管理与回滚机制：从检查点到补偿事务

在多步任务中，如果第 5 步失败，我们不应该从头开始，而应该从**最近的检查点（Checkpoint）** 恢复。这需要完善的状态管理机制。

### 3.1 检查点（Checkpointing）机制

**核心思想：** 在执行每个关键步骤前后，将当前状态序列化并持久化存储。

```python
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

class Checkpoint:
    """执行检查点"""
    def __init__(
        self,
        task_id: str,
        step_name: str,
        step_index: int,
        state: Dict[str, Any],
        timestamp: Optional[str] = None
    ):
        self.task_id = task_id
        self.step_name = step_name
        self.step_index = step_index
        self.state = state
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.checkpoint_id = str(uuid.uuid4())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "checkpoint_id": self.checkpoint_id,
            "task_id": self.task_id,
            "step_name": self.step_name,
            "step_index": self.step_index,
            "state": self.state,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Checkpoint':
        return cls(
            task_id=data["task_id"],
            step_name=data["step_name"],
            step_index=data["step_index"],
            state=data["state"],
            timestamp=data["timestamp"]
        )

class CheckpointManager:
    """
    检查点管理器
    
    负责保存和恢复任务执行状态
    """
    
    def __init__(self, storage_backend: str = "memory"):
        """
        参数:
            storage_backend: 存储后端（memory/file/database）
        """
        self.storage_backend = storage_backend
        self.checkpoints: Dict[str, Checkpoint] = {}  # task_id -> latest checkpoint
    
    def save_checkpoint(
        self,
        task_id: str,
        step_name: str,
        step_index: int,
        state: Dict[str, Any]
    ):
        """保存检查点"""
        checkpoint = Checkpoint(
            task_id=task_id,
            step_name=step_name,
            step_index=step_index,
            state=state
        )
        
        # 序列化状态（过滤不可序列化的对象）
        serializable_state = self._make_serializable(state)
        checkpoint.state = serializable_state
        
        # 存储检查点
        if self.storage_backend == "memory":
            self.checkpoints[task_id] = checkpoint
        elif self.storage_backend == "file":
            self._save_to_file(checkpoint)
        elif self.storage_backend == "database":
            self._save_to_database(checkpoint)
        
        print(f"✓ Checkpoint saved: {step_name} (step {step_index})")
        return checkpoint
    
    def load_latest_checkpoint(self, task_id: str) -> Optional[Checkpoint]:
        """加载最新的检查点"""
        if self.storage_backend == "memory":
            return self.checkpoints.get(task_id)
        elif self.storage_backend == "file":
            return self._load_from_file(task_id)
        elif self.storage_backend == "database":
            return self._load_from_database(task_id)
        return None
    
    def clear_checkpoints(self, task_id: str):
        """任务完成后清理检查点"""
        if self.storage_backend == "memory":
            self.checkpoints.pop(task_id, None)
        elif self.storage_backend == "file":
            self._delete_file(task_id)
        elif self.storage_backend == "database":
            self._delete_from_database(task_id)
    
    def _make_serializable(self, obj: Any) -> Any:
        """将对象转换为可 JSON 序列化的格式"""
        if isinstance(obj, dict):
            return {k: self._make_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif isinstance(obj, (str, int, float, bool, type(None))):
            return obj
        else:
            # 对于不可序列化的对象，转换为字符串表示
            return f"<{type(obj).__name__}: {str(obj)}>"
    
    def _save_to_file(self, checkpoint: Checkpoint):
        """保存到文件（简化版）"""
        filename = f"checkpoints/{checkpoint.task_id}.json"
        with open(filename, 'w') as f:
            json.dump(checkpoint.to_dict(), f, indent=2)
    
    def _load_from_file(self, task_id: str) -> Optional[Checkpoint]:
        """从文件加载"""
        filename = f"checkpoints/{task_id}.json"
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            return Checkpoint.from_dict(data)
        except FileNotFoundError:
            return None
    
    # 数据库存储的实现省略（可使用 SQLite/PostgreSQL/Redis）
    def _save_to_database(self, checkpoint: Checkpoint):
        pass
    
    def _load_from_database(self, task_id: str) -> Optional[Checkpoint]:
        return None
    
    def _delete_file(self, task_id: str):
        import os
        filename = f"checkpoints/{task_id}.json"
        if os.path.exists(filename):
            os.remove(filename)
    
    def _delete_from_database(self, task_id: str):
        pass
```

### 3.2 基于检查点的恢复执行

现在我们可以实现一个支持断点续传的任务执行引擎：

```python
class ResumableTaskExecutor:
    """
    可恢复的任务执行器
    
    特性：
    - 自动保存检查点
    - 支持从中断处恢复执行
    - 任务完成后自动清理检查点
    """
    
    def __init__(self, checkpoint_manager: CheckpointManager):
        self.checkpoint_manager = checkpoint_manager
        self.task_state: Dict[str, Any] = {}
    
    def execute_with_resumption(
        self,
        task_id: str,
        steps: list,
        initial_state: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        执行任务（支持断点续传）
        
        参数:
            task_id: 任务唯一标识
            steps: 执行步骤列表，每个元素是 (step_name, function)
            initial_state: 初始状态
        
        返回:
            最终状态
        """
        # 1. 尝试加载之前的检查点
        checkpoint = self.checkpoint_manager.load_latest_checkpoint(task_id)
        
        if checkpoint:
            print(f"↻ Resuming task from checkpoint: {checkpoint.step_name}")
            start_index = checkpoint.step_index + 1
            self.task_state = checkpoint.state
        else:
            print(f"▶ Starting new task: {task_id}")
            start_index = 0
            self.task_state = initial_state or {}
        
        # 2. 从检查点之后开始执行
        for i in range(start_index, len(steps)):
            step_name, step_func = steps[i]
            
            try:
                print(f"\n[{i+1}/{len(steps)}] Executing: {step_name}")
                
                # 执行步骤
                result = step_func(self.task_state)
                
                # 更新状态
                self.task_state[f"{step_name}_result"] = result
                self.task_state["last_completed_step"] = step_name
                self.task_state["last_completed_step_index"] = i
                
                # 保存检查点
                self.checkpoint_manager.save_checkpoint(
                    task_id=task_id,
                    step_name=step_name,
                    step_index=i,
                    state=self.task_state.copy()
                )
                
            except Exception as e:
                print(f"✗ Step '{step_name}' failed: {e}")
                print(f"Task paused. Use task_id '{task_id}' to resume later.")
                raise
        
        # 3. 任务完成，清理检查点
        print(f"\n✓ Task '{task_id}' completed successfully!")
        self.checkpoint_manager.clear_checkpoints(task_id)
        
        return self.task_state

# 使用示例
def step_fetch_data(state: Dict) -> Dict:
    """步骤 1：获取数据"""
    print("  → Fetching financial data from database...")
    # 模拟数据库查询
    return {"revenue": 1000000, "profit": 200000}

def step_analyze_data(state: Dict) -> Dict:
    """步骤 2：分析数据"""
    print("  → Analyzing data with LLM...")
    # 模拟 LLM 调用
    return {"trend": "positive", "growth_rate": 0.15}

def step_generate_report(state: Dict) -> str:
    """步骤 3：生成报告"""
    print("  → Generating report...")
    analysis = state.get("step_analyze_data_result", {})
    return f"Report: Growth rate is {analysis.get('growth_rate', 0)*100}%"

def step_send_email(state: Dict) -> bool:
    """步骤 4：发送邮件"""
    print("  → Sending email to CEO...")
    # 模拟邮件发送
    return True

# 创建执行器
checkpoint_mgr = CheckpointManager(storage_backend="file")
executor = ResumableTaskExecutor(checkpoint_mgr)

# 定义任务步骤
steps = [
    ("fetch_data", step_fetch_data),
    ("analyze_data", step_analyze_data),
    ("generate_report", step_generate_report),
    ("send_email", step_send_email),
]

# 执行任务
task_id = "financial-report-2026-q1"
try:
    result = executor.execute_with_resumption(
        task_id=task_id,
        steps=steps,
        initial_state={"user": "CEO", "quarter": "Q1 2026"}
    )
    print(f"\nFinal result: {result}")
except Exception as e:
    print(f"\nTask interrupted. Run again with task_id='{task_id}' to resume.")
```

**运行效果：**

```bash
# 第一次执行（假设在第 3 步失败）
▶ Starting new task: financial-report-2026-q1

[1/4] Executing: fetch_data
  → Fetching financial data from database...
✓ Checkpoint saved: fetch_data (step 0)

[2/4] Executing: analyze_data
  → Analyzing data with LLM...
✓ Checkpoint saved: analyze_data (step 1)

[3/4] Executing: generate_report
  → Generating report...
✗ Step 'generate_report' failed: Report generation timeout
Task paused. Use task_id 'financial-report-2026-q1' to resume later.

# 第二次执行（自动从第 3 步恢复）
↻ Resuming task from checkpoint: analyze_data

[3/4] Executing: generate_report
  → Generating report...
✓ Checkpoint saved: generate_report (step 2)

[4/4] Executing: send_email
  → Sending email to CEO...
✓ Checkpoint saved: send_email (step 3)

✓ Task 'financial-report-2026-q1' completed successfully!
```

### 3.3 补偿事务（Compensating Transactions）

在某些场景下，简单的检查点恢复不够。例如：
- Step 1：在数据库中创建记录
- Step 2：调用支付 API 扣款
- Step 3：发送确认邮件（失败）

如果 Step 3 失败，我们不能简单地重试 Step 3，因为 Step 2 已经扣款了。此时需要**补偿事务**来撤销已完成的操作。

```python
class CompensationHandler:
    """
    补偿事务处理器
    
    用于在任务失败时撤销已成功执行的操作
    """
    
    def __init__(self):
        self.compensation_stack: list = []  # 补偿操作栈
    
    def register_compensation(self, compensation_func, *args, **kwargs):
        """注册补偿操作"""
        self.compensation_stack.append({
            "func": compensation_func,
            "args": args,
            "kwargs": kwargs
        })
    
    def execute_all_compensations(self):
        """执行所有注册的补偿操作（逆序执行）"""
        print("\n⚠ Executing compensations to rollback changes...")
        
        errors = []
        while self.compensation_stack:
            comp = self.compensation_stack.pop()
            try:
                print(f"  → Rolling back: {comp['func'].__name__}")
                comp["func"](*comp["args"], **comp["kwargs"])
                print(f"  ✓ Compensation successful")
            except Exception as e:
                print(f"  ✗ Compensation failed: {e}")
                errors.append(e)
        
        if errors:
            raise Exception(f"Some compensations failed: {errors}")
        
        print("✓ All compensations completed")
    
    def clear(self):
        """清空补偿栈（任务成功完成后调用）"""
        self.compensation_stack.clear()

# 使用示例
comp_handler = CompensationHandler()

def step_create_order(state: Dict) -> str:
    """步骤 1：创建订单"""
    order_id = "ORD-12345"
    print(f"  → Creating order {order_id}...")
    
    # 注册补偿操作：如果后续步骤失败，删除订单
    comp_handler.register_compensation(delete_order, order_id)
    
    return order_id

def delete_order(order_id: str):
    """补偿操作：删除订单"""
    print(f"    [Compensation] Deleting order {order_id}...")
    # 实际删除逻辑

def step_charge_payment(state: Dict) -> bool:
    """步骤 2：扣款"""
    order_id = state["step_create_order_result"]
    print(f"  → Charging payment for order {order_id}...")
    
    # 注册补偿操作：如果后续步骤失败，退款
    comp_handler.register_compensation(refund_payment, order_id)
    
    return True

def refund_payment(order_id: str):
    """补偿操作：退款"""
    print(f"    [Compensation] Refunding payment for order {order_id}...")
    # 实际退款逻辑

def step_send_confirmation(state: Dict) -> bool:
    """步骤 3：发送确认邮件（可能失败）"""
    print("  → Sending confirmation email...")
    raise Exception("Email service unavailable")  # 模拟失败

# 执行带补偿的任务
try:
    state = {}
    state["step_create_order_result"] = step_create_order(state)
    state["step_charge_payment_result"] = step_charge_payment(state)
    step_send_confirmation(state)
    
    # 如果执行到这里，说明全部成功，清空补偿栈
    comp_handler.clear()
    
except Exception as e:
    print(f"\n✗ Task failed: {e}")
    # 执行补偿操作
    comp_handler.execute_all_compensations()
```

**输出：**
```
  → Creating order ORD-12345...
  → Charging payment for order ORD-12345...
  → Sending confirmation email...

✗ Task failed: Email service unavailable

⚠ Executing compensations to rollback changes...
  → Rolling back: refund_payment
    [Compensation] Refunding payment for order ORD-12345...
  ✓ Compensation successful
  → Rolling back: delete_order
    [Compensation] Deleting order ORD-12345...
  ✓ Compensation successful
✓ All compensations completed
```

**补偿事务的关键点：**
- ✅ **逆序执行**：后执行的操作先补偿（类似栈的 LIFO）
- ✅ **幂等性**：补偿操作应该可以安全地重复执行
- ✅ **记录日志**：所有补偿操作都应该详细记录，便于审计

## 4. 降级与兜底策略：优雅地应对失败

即使有重试和回滚，某些错误仍然无法恢复。此时我们需要**降级策略（Fallback Strategy）**，确保系统仍能提供部分可用的功能。

### 4.1 多层降级架构

<div align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" height="100%" style="max-width: 700px; margin: 20px 0;">
    <defs>
      <style>
        .box-primary { fill: #dbeafe; stroke: #2563eb; stroke-width: 3; rx: 10; ry: 10; }
        .box-secondary { fill: #fef08a; stroke: #ca8a04; stroke-width: 3; rx: 10; ry: 10; }
        .box-tertiary { fill: #fed7aa; stroke: #ea580c; stroke-width: 3; rx: 10; ry: 10; }
        .box-fallback { fill: #fecaca; stroke: #dc2626; stroke-width: 3; rx: 10; ry: 10; }
        .text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; text-rendering: optimizeLegibility; }
        .arrow { stroke: #334155; stroke-width: 3; marker-end: url(#arrowhead); fill: none; }
        .dashed-arrow { stroke: #475569; stroke-width: 3; stroke-dasharray: 8,5; marker-end: url(#arrowhead); fill: none; }
      </style>
      <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
      </marker>
    </defs>
    <!-- Level 1: Primary -->
    <rect x="150" y="30" width="400" height="65" class="box-primary"/>
    <text x="350" y="52" class="text" font-weight="700" font-size="18">Level 1: 主策略（Primary）</text>
    <text x="350" y="74" class="text" font-size="15" font-weight="500">GPT-4 完整分析 + 实时数据 + 精美图表</text>
    <!-- Arrow down -->
    <line x1="350" y1="95" x2="350" y2="115" class="arrow"/>
    <text x="375" y="110" class="text" font-size="13" fill="#334155" font-weight="700">失败时降级</text>
    <!-- Level 2: Secondary -->
    <rect x="150" y="125" width="400" height="65" class="box-secondary"/>
    <text x="350" y="147" class="text" font-weight="700" font-size="18">Level 2: 次选策略（Secondary）</text>
    <text x="350" y="169" class="text" font-size="15" font-weight="500">GPT-3.5 简化分析 + 缓存数据 + 文本报告</text>
    <!-- Arrow down -->
    <line x1="350" y1="190" x2="350" y2="210" class="arrow"/>
    <text x="375" y="205" class="text" font-size="13" fill="#334155" font-weight="700">仍失败时降级</text>
    <!-- Level 3: Tertiary -->
    <rect x="150" y="220" width="400" height="65" class="box-tertiary"/>
    <text x="350" y="242" class="text" font-weight="700" font-size="18">Level 3: 保底策略（Tertiary）</text>
    <text x="350" y="264" class="text" font-size="15" font-weight="500">规则引擎静态分析 + 返回原始数据</text>
    <!-- Arrow down -->
    <line x1="350" y1="285" x2="350" y2="305" class="arrow"/>
    <text x="375" y="300" class="text" font-size="13" fill="#334155" font-weight="700">极端情况</text>
    <!-- Level 4: Human Fallback -->
    <rect x="150" y="315" width="400" height="65" class="box-fallback"/>
    <text x="350" y="337" class="text" font-weight="700" font-size="18">Level 4: 人工介入（Human Fallback）</text>
    <text x="350" y="359" class="text" font-size="15" font-weight="500">通知管理员 + 保存中间结果 + 稍后重试</text>
    <!-- Side annotations -->
    <text x="45" y="65" class="text" font-size="15" fill="#1d4ed8" font-weight="800" text-anchor="end">最佳体验</text>
    <text x="45" y="160" class="text" font-size="15" fill="#a16207" font-weight="800" text-anchor="end">可用</text>
    <text x="45" y="255" class="text" font-size="15" fill="#c2410c" font-weight="800" text-anchor="end">基本可用</text>
    <text x="45" y="350" class="text" font-size="15" fill="#b91c1c" font-weight="800" text-anchor="end">需人工处理</text>
  </svg>
</div>

### 4.2 实现降级策略

```python
from typing import Callable, Optional

class FallbackChain:
    """
    降级链：按优先级依次尝试多个策略
    
    使用场景：
    - LLM API 失败时切换到备用模型
    - 实时数据不可用时使用缓存数据
    - 复杂算法失败时使用简化算法
    """
    
    def __init__(self):
        self.strategies: list = []
    
    def add_strategy(
        self,
        strategy_func: Callable,
        name: str,
        priority: int = 0
    ):
        """
        添加降级策略
        
        参数:
            strategy_func: 策略函数
            name: 策略名称
            priority: 优先级（数字越小优先级越高）
        """
        self.strategies.append({
            "func": strategy_func,
            "name": name,
            "priority": priority
        })
        # 按优先级排序
        self.strategies.sort(key=lambda x: x["priority"])
    
    def execute(self, *args, **kwargs) -> Any:
        """
        执行降级链
        
        依次尝试每个策略，直到有一个成功
        """
        last_error = None
        
        for strategy in self.strategies:
            try:
                print(f"  → Trying strategy: {strategy['name']}")
                result = strategy["func"](*args, **kwargs)
                print(f"  ✓ Strategy '{strategy['name']}' succeeded")
                return result
            
            except Exception as e:
                last_error = e
                print(f"  ✗ Strategy '{strategy['name']}' failed: {e}")
                continue
        
        # 所有策略都失败
        raise Exception(
            f"All strategies failed. Last error: {last_error}"
        )

# 使用示例：LLM 调用的多层降级
fallback_llm = FallbackChain()

def primary_strategy(prompt: str) -> str:
    """主策略：GPT-4"""
    return call_gpt4_api(prompt)

def secondary_strategy(prompt: str) -> str:
    """次选策略：GPT-3.5"""
    return call_gpt35_api(prompt)

def tertiary_strategy(prompt: str) -> str:
    """保底策略：规则引擎"""
    return rule_based_response(prompt)

# 注册策略
fallback_llm.add_strategy(primary_strategy, "GPT-4", priority=1)
fallback_llm.add_strategy(secondary_strategy, "GPT-3.5", priority=2)
fallback_llm.add_strategy(tertiary_strategy, "Rule Engine", priority=3)

# 执行
try:
    response = fallback_llm.execute("Analyze this financial data...")
    print(f"Response: {response}")
except Exception as e:
    print(f"All strategies failed: {e}")
```

### 4.3 人机协同兜底

当所有自动化策略都失败时，最后的防线是**人工介入**。但这不应该是简单的报错，而应该：
1. 保存所有中间结果
2. 清晰描述问题和上下文
3. 提供便捷的恢复入口

```python
def human_fallback_handler(
    task_id: str,
    error: Exception,
    context: Dict[str, Any],
    notification_channels: list = ["email", "slack"]
):
    """
    人工介入处理器
    
    当所有自动化策略失败时，通知人工处理
    """
    # 1. 保存现场
    incident_report = {
        "task_id": task_id,
        "timestamp": datetime.utcnow().isoformat(),
        "error": str(error),
        "error_type": type(error).__name__,
        "context": context,
        "status": "awaiting_human_intervention"
    }
    
    # 保存到数据库或文件系统
    save_incident_report(incident_report)
    
    # 2. 发送通知
    message = f"""
🚨 AI Agent Task Failed - Human Intervention Required

Task ID: {task_id}
Error: {error}
Time: {incident_report['timestamp']}

Context Summary:
- Last completed step: {context.get('last_completed_step', 'N/A')}
- User: {context.get('user', 'N/A')}

Action Required:
1. Review the incident report
2. Manually complete the task or fix the issue
3. Resume the task using: resume_task('{task_id}')

Incident Report: /incidents/{task_id}.json
    """
    
    for channel in notification_channels:
        if channel == "email":
            send_email(
                to="admin@example.com",
                subject=f"[URGENT] AI Agent Task Failed: {task_id}",
                body=message
            )
        elif channel == "slack":
            send_slack_notification(
                channel="#ai-alerts",
                message=message
            )
    
    print(f"⚠ Human intervention requested for task: {task_id}")
    return incident_report
```

## 5. 综合实战：构建工业级容错 Agent 引擎

现在我们将前面学到的所有技术整合在一起，构建一个完整的容错 Agent 执行引擎。

```python
import time
import json
from typing import Dict, Any, List, Callable, Optional
from dataclasses import dataclass, field

@dataclass
class TaskConfig:
    """任务配置"""
    task_id: str
    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0
    enable_checkpointing: bool = True
    enable_circuit_breaker: bool = True
    enable_fallback: bool = True
    timeout: Optional[float] = 300.0  # 5分钟超时

class FaultTolerantAgentEngine:
    """
    工业级容错 Agent 引擎
    
    集成特性：
    - 智能重试（指数退避 + 熔断器）
    - 状态管理（检查点 + 恢复执行）
    - 补偿事务（失败回滚）
    - 降级策略（多层兜底）
    - 超时控制
    - 完整日志与监控
    """
    
    def __init__(self, config: TaskConfig):
        self.config = config
        self.checkpoint_mgr = CheckpointManager(storage_backend="file")
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.compensation_handler = CompensationHandler()
        self.execution_log: List[Dict[str, Any]] = []
    
    def get_circuit_breaker(self, service_name: str) -> CircuitBreaker:
        """获取或创建熔断器"""
        if service_name not in self.circuit_breakers:
            self.circuit_breakers[service_name] = CircuitBreaker(
                failure_threshold=5,
                recovery_timeout=60.0
            )
        return self.circuit_breakers[service_name]
    
    def execute_step_with_protection(
        self,
        step_name: str,
        step_func: Callable,
        *args,
        **kwargs
    ) -> Any:
        """
        在多重保护下执行单个步骤
        
        保护机制：
        1. 熔断器检查
        2. 超时控制
        3. 智能重试
        4. 降级策略
        """
        service_name = step_func.__name__
        cb = self.get_circuit_breaker(service_name)
        
        # 1. 熔断器检查
        if not cb.can_execute():
            raise Exception(f"Circuit breaker OPEN for {service_name}")
        
        last_error = None
        
        # 2. 重试循环
        for attempt in range(self.config.max_retries + 1):
            try:
                # 3. 超时控制
                if self.config.timeout:
                    result = self._execute_with_timeout(
                        step_func, 
                        self.config.timeout, 
                        *args, 
                        **kwargs
                    )
                else:
                    result = step_func(*args, **kwargs)
                
                # 记录成功
                cb.record_success()
                self._log_execution(step_name, attempt, "success", None)
                return result
            
            except Exception as e:
                last_error = e
                error_type = classify_error(e)
                
                # 记录失败
                cb.record_failure()
                self._log_execution(step_name, attempt, "failed", str(e))
                
                # 永久性错误不重试
                if error_type == ErrorType.PERMANENT:
                    raise ValueError(f"Permanent error in {step_name}: {e}")
                
                # 达到最大重试次数
                if attempt >= self.config.max_retries:
                    break
                
                # 计算退避时间
                delay = min(
                    self.config.base_delay * (2 ** attempt),
                    self.config.max_delay
                )
                print(f"  ⏳ Retry {attempt + 1}/{self.config.max_retries} in {delay:.2f}s...")
                time.sleep(delay)
        
        # 4. 所有重试失败，尝试降级策略
        if self.config.enable_fallback:
            print(f"  ↓ Attempting fallback for {step_name}...")
            try:
                fallback_result = self._try_fallback(step_name, *args, **kwargs)
                print(f"  ✓ Fallback succeeded")
                return fallback_result
            except Exception as fallback_error:
                print(f"  ✗ Fallback also failed: {fallback_error}")
        
        # 5. 彻底失败
        raise Exception(
            f"Step '{step_name}' failed after {self.config.max_retries} retries. "
            f"Last error: {last_error}"
        )
    
    def _execute_with_timeout(
        self, 
        func: Callable, 
        timeout: float, 
        *args, 
        **kwargs
    ) -> Any:
        """带超时控制的执行"""
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError(f"Execution timed out after {timeout}s")
        
        # 设置超时信号
        old_handler = signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(int(timeout))
        
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            # 取消超时
            signal.alarm(0)
            signal.signal(signal.SIGALRM, old_handler)
    
    def _try_fallback(
        self, 
        step_name: str, 
        *args, 
        **kwargs
    ) -> Any:
        """尝试降级策略"""
        fallback_strategies = {
            "call_llm_api": self._fallback_llm,
            "fetch_external_data": self._fallback_cached_data,
            "generate_complex_report": self._fallback_simple_summary,
        }
        
        fallback_func = fallback_strategies.get(step_name)
        if fallback_func:
            return fallback_func(*args, **kwargs)
        else:
            raise Exception(f"No fallback strategy for {step_name}")
    
    def _fallback_llm(self, prompt: str, **kwargs) -> str:
        """LLM 降级：使用更便宜的模型"""
        print("    [Fallback] Using GPT-3.5 instead of GPT-4")
        return call_gpt35_api(prompt)
    
    def _fallback_cached_data(self, query: str, **kwargs) -> Dict:
        """数据获取降级：使用缓存"""
        print("    [Fallback] Using cached data")
        return load_from_cache(query)
    
    def _fallback_simple_summary(self, data: Dict, **kwargs) -> str:
        """报告生成降级：生成简化版"""
        print("    [Fallback] Generating simplified summary")
        return f"Simplified summary: {str(data)[:500]}..."
    
    def execute_workflow(
        self,
        steps: List[tuple],
        initial_state: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        执行完整的工作流
        
        参数:
            steps: 步骤列表 [(step_name, step_func), ...]
            initial_state: 初始状态
        
        返回:
            最终状态
        """
        task_id = self.config.task_id
        state = initial_state or {}
        
        # 尝试从检查点恢复
        checkpoint = self.checkpoint_mgr.load_latest_checkpoint(task_id)
        if checkpoint:
            print(f"↻ Resuming from checkpoint: {checkpoint.step_name}")
            start_index = checkpoint.step_index + 1
            state = checkpoint.state
        else:
            print(f"▶ Starting new workflow: {task_id}")
            start_index = 0
        
        # 执行步骤
        for i in range(start_index, len(steps)):
            step_name, step_func = steps[i]
            
            try:
                print(f"\n[{i+1}/{len(steps)}] Executing: {step_name}")
                
                # 在保护下执行步骤
                result = self.execute_step_with_protection(
                    step_name, 
                    step_func, 
                    state
                )
                
                # 更新状态
                state[f"{step_name}_result"] = result
                state["last_completed_step"] = step_name
                state["last_completed_step_index"] = i
                
                # 注册补偿操作（如果需要）
                if hasattr(step_func, "__compensation__"):
                    comp_func = step_func.__compensation__
                    self.compensation_handler.register_compensation(
                        comp_func, 
                        result
                    )
                
                # 保存检查点
                if self.config.enable_checkpointing:
                    self.checkpoint_mgr.save_checkpoint(
                        task_id=task_id,
                        step_name=step_name,
                        step_index=i,
                        state=state.copy()
                    )
                
            except Exception as e:
                print(f"\n✗ Workflow failed at step '{step_name}': {e}")
                
                # 执行补偿事务
                if self.compensation_handler.compensation_stack:
                    try:
                        self.compensation_handler.execute_all_compensations()
                    except Exception as comp_error:
                        print(f"⚠ Compensation also failed: {comp_error}")
                
                # 人工介入
                human_fallback_handler(
                    task_id=task_id,
                    error=e,
                    context=state
                )
                
                raise
        
        # 工作流成功完成
        print(f"\n✓ Workflow '{task_id}' completed successfully!")
        self.compensation_handler.clear()
        self.checkpoint_mgr.clear_checkpoints(task_id)
        
        # 保存执行日志
        self._save_execution_log()
        
        return state
    
    def _log_execution(
        self, 
        step_name: str, 
        attempt: int, 
        status: str, 
        error: Optional[str]
    ):
        """记录执行日志"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "task_id": self.config.task_id,
            "step_name": step_name,
            "attempt": attempt,
            "status": status,
            "error": error
        }
        self.execution_log.append(log_entry)
    
    def _save_execution_log(self):
        """保存执行日志"""
        log_filename = f"logs/{self.config.task_id}_execution_log.json"
        with open(log_filename, 'w') as f:
            json.dump(self.execution_log, f, indent=2)
        print(f"📝 Execution log saved to {log_filename}")


# ==================== 使用示例 ====================

def example_financial_analysis_workflow():
    """示例：财务分析工作流"""
    
    # 定义步骤
    def fetch_financial_data(state: Dict) -> Dict:
        """步骤 1：获取财务数据"""
        # 模拟 API 调用
        return {"revenue": 1000000, "profit": 200000, "expenses": 800000}
    
    def analyze_trends(state: Dict) -> Dict:
        """步骤 2：分析趋势"""
        data = state["fetch_financial_data_result"]
        # 模拟 LLM 分析
        return {
            "trend": "positive",
            "growth_rate": 0.15,
            "recommendation": "Continue current strategy"
        }
    
    def generate_visualization(state: Dict) -> str:
        """步骤 3：生成可视化"""
        # 模拟图表生成
        return "chart_q3_2026.png"
    
    def compile_report(state: Dict) -> str:
        """步骤 4：编写报告"""
        analysis = state["analyze_trends_result"]
        chart = state["generate_visualization_result"]
        return f"Q3 Report: {analysis['trend']} growth ({chart})"
    
    def send_to_stakeholders(state: Dict) -> bool:
        """步骤 5：发送给利益相关者"""
        report = state["compile_report_result"]
        # 模拟邮件发送
        print(f"  Sending report: {report}")
        return True
    
    steps = [
        ("fetch_financial_data", fetch_financial_data),
        ("analyze_trends", analyze_trends),
        ("generate_visualization", generate_visualization),
        ("compile_report", compile_report),
        ("send_to_stakeholders", send_to_stakeholders),
    ]
    
    # 创建引擎
    config = TaskConfig(
        task_id="financial-analysis-q3-2026",
        max_retries=3,
        base_delay=1.0,
        max_delay=30.0,
        enable_checkpointing=True,
        enable_circuit_breaker=True,
        enable_fallback=True,
        timeout=300.0
    )
    
    engine = FaultTolerantAgentEngine(config)
    
    # 执行工作流
    try:
        result = engine.execute_workflow(
            steps=steps,
            initial_state={"quarter": "Q3 2026", "user": "CFO"}
        )
        print(f"\n✅ Final Result: {result}")
    except Exception as e:
        print(f"\n❌ Workflow failed: {e}")

# 运行示例
if __name__ == "__main__":
    example_financial_analysis_workflow()
```

## 6. 生产环境的最佳实践

在实际部署容错 Agent 系统时，还需要注意以下几点：

### 6.1 监控与告警

```python
# 关键指标监控
metrics = {
    "task_success_rate": 0.95,        # 任务成功率
    "average_retry_count": 1.2,       # 平均重试次数
    "circuit_breaker_trips": 3,       # 熔断器触发次数
    "fallback_usage_rate": 0.05,      # 降级策略使用率
    "average_execution_time": 45.3,   # 平均执行时间（秒）
    "compensation_trigger_rate": 0.02 # 补偿事务触发率
}

# 告警规则
alerts = [
    "成功率 < 90% → P1 告警",
    "熔断器触发 > 10 次/小时 → P2 告警",
    "降级策略使用率 > 20% → P2 告警",
    "平均执行时间 > 2x 基线 → P3 告警",
]
```

### 6.2 日志与追踪

- **结构化日志**：使用 JSON 格式记录所有关键事件
- **分布式追踪**：为每个任务分配唯一的 Trace ID，贯穿整个执行链路
- **审计日志**：记录所有补偿事务和人工介入操作

### 6.3 性能优化

- **异步执行**：对于独立步骤，使用 asyncio 并行执行
- **缓存策略**：缓存 LLM 响应、外部 API 数据
- **资源池化**：复用数据库连接、HTTP 会话

### 6.4 测试策略

```python
# 混沌工程测试
chaos_tests = [
    "随机注入网络延迟",
    "模拟 LLM API 503 错误",
    "强制触发熔断器",
    "模拟检查点损坏",
    "测试并发任务冲突",
]
```

## 结语

> **可靠性不是偶然，而是设计的结果。**

通过本篇的学习，我们掌握了构建生产级 AI Agent 的核心容错技术：

1. **智能重试**：指数退避 + 熔断器，避免重试风暴
2. **状态管理**：检查点机制，支持断点续传
3. **补偿事务**：失败时自动回滚，保证数据一致性
4. **降级策略**：多层兜底，优雅应对各种故障
5. **人机协同**：最后的防线，确保关键任务不丢失

这些技术不仅是 AI Agent 的核心，也是所有分布式系统的基础。正如 Netflix 的 Chaos Monkey 所证明的：**只有经过充分容错设计的系统，才能在真实的混乱环境中生存下来。**

至此，我们完成了 **《AI 技术演进与核心算法实战》第四模块：行动篇** 的全部内容。从 Function Calling 的工具调用，到 ReAct 的思考-行动循环，再到自主规划和工作流编排，最后到工业级的容错设计——我们已经赋予了 AI 完整的"行动能力"。

下一篇，我们将进入 **第五模块：协作篇**，探索多 Agent 系统的奥秘。当单个 Agent 的能力遇到瓶颈时，如何通过多个 Agent 的协作产生"群体智能"？敬请期待 **《多 Agent 协作模式：Hierarchical、Sequential 与 Joint 架构对比》**。

---

## 📚 参考文献与延伸阅读

1. **Release It!: Design and Deploy Production-Ready Software** (Michael Nygard) - 经典的生产系统稳定性设计指南，详细介绍了熔断器、舱壁隔离等模式。
2. **The Circuit Breaker Pattern** (Martin Fowler) - 熔断器模式的权威解释，理解微服务容错的核心。
3. **Exponential Backoff And Jitter** (AWS Architecture Blog) - AWS 官方博客，深入讲解指数退避算法的原理和实践。
4. **Saga Pattern for Microservices** (Chris Richardson) - 补偿事务的经典实现模式，适用于长运行事务。
5. **Chaos Engineering: System Resiliency in Practice** (Casey Rosenthal) - 混沌工程实践，通过主动注入故障来提升系统可靠性。
6. **LangGraph Documentation: Persistence & Checkpointing** - LangGraph 的检查点和状态管理实现，工业级参考。

---
> **下一篇预告：** [多 Agent 协作模式：Hierarchical（层级）、Sequential（流水线）与 Joint（联合）架构对比](#)
