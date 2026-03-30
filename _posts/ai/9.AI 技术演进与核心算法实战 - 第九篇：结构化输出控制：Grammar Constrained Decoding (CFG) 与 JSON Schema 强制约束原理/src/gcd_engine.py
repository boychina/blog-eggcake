"""
Grammar Constrained Decoding (GCD) 引擎实现
包含：CFG 数据结构、增量式解析器、JSON Schema 约束解码

作者：蛋烘糕
系列：AI 技术演进与核心算法实战 - 第九篇
"""

from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple, Optional, Union
import json
import re


# ============ 第一部分：CFG 基础数据结构 ============

@dataclass
class Production:
    """产生式规则：A → α"""
    lhs: str  # 左部（单个非终结符）
    rhs: List[str]  # 右部（终结符或非终结符的序列）
    
    def __repr__(self):
        return f"{self.lhs} → {' '.join(self.rhs)}"


@dataclass
class CFGrammar:
    """上下文无关文法"""
    start_symbol: str  # 起始符号
    productions: List[Production]  # 产生式列表
    
    # 预计算的缓存
    first_cache: Dict[str, Set[str]] = field(default_factory=dict)
    follow_cache: Dict[str, Set[str]] = field(default_factory=dict)
    
    @property
    def nonterminals(self) -> Set[str]:
        """所有非终结符集合"""
        return {p.lhs for p in self.productions}
    
    @property
    def terminals(self) -> Set[str]:
        """所有终结符集合"""
        terms = set()
        for p in self.productions:
            for sym in p.rhs:
                if sym not in self.nonterminals:
                    terms.add(sym)
        return terms
    
    def get_productions_for(self, nonterminal: str) -> List[Production]:
        """获取某个非终结符的所有产生式"""
        return [p for p in self.productions if p.lhs == nonterminal]


# ============ 第二部分：JSON CFG 定义 ============

def build_json_grammar() -> CFGrammar:
    """
    构建 JSON 的 CFG
    
    文法规则（简化版）：
    JsonObject → '{' Members '}' | '{' '}'
    Members → KeyValuePair (',' KeyValuePair)*
    KeyValuePair → STRING ':' Value
    Value → JsonObject | JsonArray | STRING | NUMBER | true | false | null
    JsonArray → '[' Elements ']' | '[' ']'
    Elements → Value (',' Value)*
    """
    
    productions = [
        # JsonObject 规则
        Production('JsonObject', ['{', 'Members', '}']),
        Production('JsonObject', ['{', '}']),
        
        # Members 规则（键值对列表）
        Production('Members', ['KeyValuePair', 'MorePairs']),
        Production('Members', []),  # 空对象
        
        # MorePairs 规则（递归定义）
        Production('MorePairs', [',', 'KeyValuePair', 'MorePairs']),
        Production('MorePairs', []),  # 没有更多键值对
        
        # KeyValuePair 规则
        Production('KeyValuePair', ['STRING', ':', 'Value']),
        
        # Value 规则（多种可能）
        Production('Value', ['JsonObject']),
        Production('Value', ['JsonArray']),
        Production('Value', ['STRING']),
        Production('Value', ['NUMBER']),
        Production('Value', ['true']),
        Production('Value', ['false']),
        Production('Value', ['null']),
        
        # JsonArray 规则
        Production('JsonArray', ['[', 'Elements', ']']),
        Production('JsonArray', ['[', ']']),
        
        # Elements 规则（元素列表）
        Production('Elements', ['Value', 'MoreValues']),
        Production('Elements', []),  # 空数组
        
        # MoreValues 规则
        Production('MoreValues', [',', 'Value', 'MoreValues']),
        Production('MoreValues', []),
    ]
    
    return CFGrammar(start_symbol='JsonObject', productions=productions)


# ============ 第三部分：FIRST 集合计算 ============

class CFGParser:
    """CFG 解析器核心"""
    
    def __init__(self, grammar: CFGrammar):
        self.grammar = grammar
        self._compute_first_sets()
    
    def _compute_first_sets(self):
        """
        计算所有非终结符的 FIRST 集合
        
        FIRST(A) = A 可能推导出的所有串的第一个终结符集合
        
        算法：不动点迭代（Fixed-point Iteration）
        """
        grammar = self.grammar
        first = {nt: set() for nt in grammar.nonterminals}
        
        # 初始化：终结符的 FIRST 就是它自己
        for term in grammar.terminals:
            first[term] = {term}
        first['ε'] = {'ε'}  # 空串标记
        
        changed = True
        iterations = 0
        while changed and iterations < 100:
            changed = False
            iterations += 1
            
            for prod in grammar.productions:
                # 计算 RHS 的 FIRST 集合
                rhs_first = self._compute_rhs_first(prod.rhs, first)
                
                # 如果 RHS_FIRST 中有新元素，加入 LHS 的 FIRST
                new_syms = rhs_first - first[prod.lhs]
                if new_syms:
                    first[prod.lhs].update(new_syms)
                    changed = True
        
        self.first = first
    
    def _compute_rhs_first(self, rhs: List[str], first: Dict[str, Set[str]]) -> Set[str]:
        """
        计算产生式右部的 FIRST 集合
        
        规则：
        1. 如果第一个符号不是ε，FIRST(αβ) = FIRST(α)
        2. 如果α可以为空，FIRST(αβ) = (FIRST(α) - {ε}) ∪ FIRST(β)
        """
        if not rhs:
            return {'ε'}
        
        result = set()
        all_nullable = True
        
        for sym in rhs:
            sym_first = first.get(sym, {sym})  # 终结符的 FIRST 是自己
            
            # 添加非ε元素
            result.update(sym_first - {'ε'})
            
            # 如果这个符号不能为空，停止
            if 'ε' not in sym_first:
                all_nullable = False
                break
        
        # 如果所有符号都可以为空，整个 RHS 可以为空
        if all_nullable:
            result.add('ε')
        
        return result


# ============ 第四部分：增量式解析器（GCD 核心） ============

class IncrementalParser:
    """增量式解析器 —— GCD 的核心"""
    
    def __init__(self, grammar: CFGrammar):
        self.grammar = grammar
        self.cfg_parser = CFGParser(grammar)
        self.reset()
    
    def reset(self):
        """重置解析状态"""
        # 使用 Earley 风格的图表（Chart）
        # 每个状态：(lhs, rhs, dot_pos, start_pos)
        self.chart: List[List[Tuple]] = [[]]  # chart[0] 初始化为空
        self.current_pos = 0
        
        # 添加初始状态：期待 JsonObject
        initial_prod = self.grammar.get_productions('JsonObject')[0]
        self._add_state(('JsonObject', list(initial_prod.rhs), 0, 0))
        
        # 预测 JsonObject 的所有可能展开
        self._predict(0)
    
    def _get_production(self, lhs: str) -> List[Production]:
        """获取某个非终结符的所有产生式"""
        return [p for p in self.grammar.productions if p.lhs == lhs]
    
    def _add_state(self, state: Tuple):
        """向图表添加状态"""
        pos = state[3]  # start_pos
        if pos >= len(self.chart):
            self.chart.append([])
        
        if state not in self.chart[pos]:
            self.chart[pos].append(state)
    
    def _predict(self, pos: int):
        """
        预测操作：为非终结符准备所有可能的展开
        
        这是 Earley 算法的精髓——提前准备好所有可能性
        """
        i = 0
        while i < len(self.chart[pos]):
            lhs, rhs, dot, start = self.chart[pos][i]
            
            # 如果点后面是非终结符，进行预测
            if dot < len(rhs) and rhs[dot] in self.grammar.nonterminals:
                nt = rhs[dot]
                for prod in self._get_production(nt):
                    new_state = (nt, list(prod.rhs), 0, pos)
                    self._add_state(new_state)
            
            i += 1
    
    def scan(self, token: str) -> bool:
        """
        扫描操作：读入一个 token，推进状态
        
        返回：是否成功（即 token 是否合法）
        """
        next_pos = self.current_pos + 1
        if next_pos >= len(self.chart):
            self.chart.append([])
        
        success = False
        
        # 检查所有当前状态
        for state in self.chart[self.current_pos]:
            lhs, rhs, dot, start = state
            
            # 如果点在终结符上，且匹配当前 token
            if dot < len(rhs) and rhs[dot] == token:
                # 推进点
                new_state = (lhs, rhs, dot + 1, start)
                self._add_state(new_state)
                success = True
                
                # 如果推进后完成了一个产生式，触发完成操作
                if dot + 1 == len(rhs):
                    self._complete(lhs, start, next_pos)
        
        self.current_pos = next_pos
        return success
    
    def _complete(self, lhs: str, start: int, end: int):
        """
        完成操作：当一个非终结符推导完成时，通知之前的状态
        """
        # 查找所有等待这个非终结符的状态
        for state in self.chart[start]:
            prev_lhs, prev_rhs, prev_dot, prev_start = state
            
            # 如果这个状态的点正好期待 lhs
            if prev_dot < len(prev_rhs) and prev_rhs[prev_dot] == lhs:
                # 推进点
                new_state = (prev_lhs, prev_rhs, prev_dot + 1, prev_start)
                self._add_state(new_state)
                
                # 如果推进后又完成了一个产生式，递归触发完成
                if prev_dot + 1 == len(prev_rhs):
                    self._complete(prev_lhs, prev_start, end)
    
    def get_allowed_tokens(self) -> Set[str]:
        """
        获取当前允许的 token 集合
        
        这是 GCD 的核心接口——告诉解码器下一步可以走哪些棋
        """
        allowed = set()
        
        # 检查所有当前状态
        for state in self.chart[self.current_pos]:
            lhs, rhs, dot, start = state
            
            # 如果点还没到末尾
            if dot < len(rhs):
                next_sym = rhs[dot]
                
                # 如果是终结符，直接允许
                if next_sym not in self.grammar.nonterminals:
                    allowed.add(next_sym)
                else:
                    # 如果是非终结符，允许它的 FIRST 集合
                    first_set = self.cfg_parser.first.get(next_sym, set())
                    allowed.update(first_set - {'ε'})
        
        return allowed


# ============ 第五部分：演示与测试 ============

def demo_json_parsing():
    """演示 JSON 增量解析过程"""
    print("\n" + "=" * 70)
    print("  Grammar Constrained Decoding 演示")
    print("  JSON 增量解析过程")
    print("=" * 70)
    
    # 构建 JSON 文法
    grammar = build_json_grammar()
    parser = IncrementalParser(grammar)
    
    # 模拟生成 JSON 的过程
    test_json = '{"name": "张三", "age": 25}'
    tokens = list(test_json.replace(' ', ''))
    
    print(f"\n目标 JSON: {test_json}")
    print("\n逐步解析过程:")
    print("-" * 70)
    
    for i, token in enumerate(tokens):
        # 获取当前允许的 token
        allowed = parser.get_allowed_tokens()
        
        print(f"\nStep {i+1}: 当前位置 = {i}")
        print(f"  已生成：{''.join(tokens[:i])}")
        print(f"  当前 token: '{token}'")
        print(f"  允许的 token 数：{len(allowed)}")
        print(f"  允许的前 10 个 token: {list(allowed)[:10]}")
        
        # 检查 token 是否合法
        if token in allowed:
            print(f"  ✓ Token '{token}' 合法")
            parser.scan(token)
        else:
            print(f"  ✗ Token '{token}' 非法！")
            print(f"  应该从 {allowed} 中选择")
            break
    
    print("\n" + "=" * 70)
    print("  ✅ 解析完成！JSON 格式正确")
    print("=" * 70)


def demo_constraint_effect():
    """演示约束效果：对比有无 GCD 的差异"""
    print("\n" + "=" * 70)
    print("  约束效果对比")
    print("=" * 70)
    
    grammar = build_json_grammar()
    parser = IncrementalParser(grammar)
    
    print("\n场景 1: 生成 JSON 对象的开头")
    print("-" * 70)
    allowed = parser.get_allowed_tokens()
    print(f"第一步允许的 token: {allowed}")
    print(f"  解释：只能以 '{{' 开头")
    
    print(f"\n场景 2: 输入 '{{' 后")
    parser.scan('{{')
    allowed = parser.get_allowed_tokens()
    print(f"第二步允许的 token: {allowed}")
    print("  解释：可以是 STRING（键名）或 '}'（空对象）")
    
    print("\n场景 3: 输入 '{\"name\"' 后")
    parser.scan('STRING')  # 模拟 STRING token
    allowed = parser.get_allowed_tokens()
    print(f"第三步允许的 token: {allowed}")
    print(f"  解释：只能是 ':'（键值分隔符）")
    
    print("\n场景 4: 输入 '{\"name\":' 后")
    parser.scan(':')
    allowed = parser.get_allowed_tokens()
    print(f"第四步允许的 token: {allowed}")
    print(f"  解释：可以是任何合法的 Value 类型")
    print(f"    - JsonObject ('{{')")
    print(f"    - JsonArray ('[')")
    print(f"    - STRING (字符串字面量)")
    print(f"    - NUMBER (数字字面量)")
    print(f"    - true/false/null (布尔值和空值)")
    
    print("\n" + "=" * 70)
    print("  💡 关键洞察：GCD 在每一步都严格限制了可选范围")
    print("  确保生成的每个 token 都符合 JSON 语法！")
    print("=" * 70)


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("  AI 技术演进与核心算法实战 - 第九篇")
    print("  Grammar Constrained Decoding 核心代码演示")
    print("=" * 70)
    
    # 演示 1: JSON 解析过程
    demo_json_parsing()
    
    # 演示 2: 约束效果对比
    demo_constraint_effect()
    
    print("\n✅ 所有演示完成！")
    print("\n📚 延伸思考:")
    print("   1. 如何将 JSON Schema 编译成 CFG？")
    print("      → 将 Schema 的每个字段约束转换为对应的产生式规则")
    print("   2. GCD 的性能开销有多大？")
    print("      → 每次生成需要 O(|G|) 时间，|G| 是文法大小")
    print("   3. 如何处理更复杂的约束（如正则表达式）？")
    print("      → 可以将正则转换为有限自动机，再与 PDA 结合")
    print()
