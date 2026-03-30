"""
解码策略可视化实验
Temperature, Top-P, Top-K 对生成多样性的影响

作者：蛋烘糕
日期：2025-12-07
"""

import numpy as np
from typing import List, Tuple, Dict
import matplotlib.pyplot as plt
from collections import Counter


def softmax_with_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """
    带温度的 Softmax 函数
    
    Args:
        logits: 模型输出的未归一化分数
        temperature: 温度参数，T>0
        
    Returns:
        归一化的概率分布
    """
    scaled_logits = np.array(logits) / temperature
    exp_logits = np.exp(scaled_logits)
    return exp_logits / np.sum(exp_logits)


def top_k_sampling(logits: np.ndarray, k: int, temperature: float = 1.0) -> int:
    """
    Top-K 采样
    
    Args:
        logits: 模型输出的 logits 数组
        k: 保留的候选数量
        temperature: 温度参数
        
    Returns:
        选中的 token 索引
    """
    # Step 1: 应用温度
    scaled_logits = logits / temperature
    
    # Step 2: 找出 Top-K 的索引
    top_k_indices = np.argsort(logits)[-k:]
    top_k_logits = logits[top_k_indices]
    
    # Step 3: 对 Top-K 应用 Softmax
    exp_logits = np.exp(top_k_logits / temperature)
    probs = exp_logits / np.sum(exp_logits)
    
    # Step 4: 从 Top-K 中采样
    chosen_index = np.random.choice(top_k_indices, p=probs)
    
    return chosen_index


def top_p_sampling(logits: np.ndarray, p: float = 0.9, temperature: float = 1.0) -> int:
    """
    Top-P (Nucleus) 采样
    
    Args:
        logits: 模型输出的 logits 数组
        p: 累积概率阈值 (0 < p <= 1)
        temperature: 温度参数
        
    Returns:
        选中的 token 索引
    """
    # Step 1: 应用温度
    scaled_logits = logits / temperature
    
    # Step 2: 计算概率
    exp_logits = np.exp(scaled_logits)
    probs = exp_logits / np.sum(exp_logits)
    
    # Step 3: 按概率降序排序
    sorted_indices = np.argsort(probs)[::-1]
    sorted_probs = probs[sorted_indices]
    
    # Step 4: 计算累积概率
    cumulative_probs = np.cumsum(sorted_probs)
    
    # Step 5: 找到第一个超过阈值的位置
    cutoff_index = np.searchsorted(cumulative_probs, p) + 1
    
    # Step 6: 截取候选集
    nucleus_indices = sorted_indices[:cutoff_index]
    nucleus_probs = sorted_probs[:cutoff_index]
    
    # Step 7: 重新归一化
    nucleus_probs = nucleus_probs / np.sum(nucleus_probs)
    
    # Step 8: 采样
    chosen_token = np.random.choice(nucleus_indices, p=nucleus_probs)
    
    return chosen_token


def visualize_temperature_effect():
    """
    可视化 Temperature 对概率分布的影响
    """
    print("=" * 60)
    print("实验 1: Temperature 对概率分布的影响")
    print("=" * 60)
    
    # 模拟模型输出的 logits
    logits = np.array([3.0, 2.0, 1.0, 0.5, 0.2])
    tokens = ["苹果", "果实", "水果", "果树", "果酱"]
    
    print(f"\n原始 logits: {logits}")
    print(f"对应 tokens: {tokens}")
    print("\n不同温度下的概率分布:")
    print("-" * 60)
    
    temperatures = [0.3, 0.5, 0.7, 1.0, 1.5, 2.0]
    
    for T in temperatures:
        probs = softmax_with_temperature(logits, T)
        print(f"\nT = {T:.1f}:")
        for i, (token, prob) in enumerate(zip(tokens, probs)):
            bar = "█" * int(prob * 50)
            print(f"  {token:6s}: {prob:6.3f} {bar}")
        
        # 计算熵 (衡量不确定性)
        entropy = -np.sum(probs * np.log2(probs + 1e-10))
        print(f"  分布熵：{entropy:.3f} (越大越均匀)")


def compare_sampling_strategies():
    """
    对比不同采样策略的效果
    """
    print("\n" + "=" * 60)
    print("实验 2: 不同采样策略对比")
    print("=" * 60)
    
    # 模拟一个更真实的场景：词汇表大小为 1000
    vocab_size = 1000
    
    # 创建一个长尾分布：前几个 token 概率高，后面迅速衰减
    logits = np.random.normal(0, 2, vocab_size)
    logits[0] = 5.0  # 最高概率的 token
    logits[1] = 4.5
    logits[2] = 4.0
    logits[3] = 3.5
    logits[4] = 3.0
    
    print(f"\n词汇表大小：{vocab_size}")
    print("模拟采样实验 (每种策略采样 100 次)...")
    
    # 策略 1: Greedy (贪心)
    greedy_token = np.argmax(logits)
    print(f"\n1. 贪心解码：总是选择 token_{greedy_token}")
    
    # 策略 2: Temperature Sampling
    temp_samples = []
    for _ in range(100):
        token_idx = top_k_sampling(logits, k=vocab_size, temperature=0.8)
        temp_samples.append(token_idx)
    
    unique_tokens = len(set(temp_samples))
    most_common = Counter(temp_samples).most_common(1)[0]
    print(f"\n2. Temperature Sampling (T=0.8):")
    print(f"   不同 token 数量：{unique_tokens}")
    print(f"   最常见 token: token_{most_common[0]} (出现{most_common[1]}次)")
    
    # 策略 3: Top-K Sampling
    topk_samples = []
    for _ in range(100):
        token_idx = top_k_sampling(logits, k=50, temperature=1.0)
        topk_samples.append(token_idx)
    
    unique_tokens = len(set(topk_samples))
    most_common = Counter(topk_samples).most_common(1)[0]
    print(f"\n3. Top-K Sampling (K=50):")
    print(f"   不同 token 数量：{unique_tokens}")
    print(f"   最常见 token: token_{most_common[0]} (出现{most_common[1]}次)")
    
    # 策略 4: Top-P Sampling
    topp_samples = []
    for _ in range(100):
        token_idx = top_p_sampling(logits, p=0.9, temperature=1.0)
        topp_samples.append(token_idx)
    
    unique_tokens = len(set(topp_samples))
    most_common = Counter(topp_samples).most_common(1)[0]
    print(f"\n4. Top-P Sampling (P=0.9):")
    print(f"   不同 token 数量：{unique_tokens}")
    print(f"   最常见 token: token_{most_common[0]} (出现{most_common[1]}次)")


def interactive_demo():
    """
    交互式演示：用户可以调整参数看效果
    """
    print("\n" + "=" * 60)
    print("实验 3: 交互式参数调节演示")
    print("=" * 60)
    
    # 简化的词汇表
    tokens = ["好", "很好", "不错", "还行", "一般", "较差", "很差"]
    base_logits = np.array([4.0, 3.0, 2.0, 1.0, 0.5, -0.5, -1.0])
    
    print("\n基础场景：给定上文'今天天气',预测下一个词")
    print(f"候选词：{tokens}")
    print("\n请尝试不同的参数组合 (输入 q 退出):")
    
    while True:
        try:
            t = float(input("\nTemperature (建议 0.1-2.0, 输入 q 退出): "))
            if t <= 0:
                print("❌ Temperature 必须大于 0!")
                continue
                
            k = int(input("Top-K (建议 1-10, 0 表示不使用): "))
            p = float(input("Top-P (建议 0.5-1.0): "))
            
            # 应用 Temperature
            probs = softmax_with_temperature(base_logits, t)
            
            # 应用 Top-K
            if k > 0:
                top_k_indices = np.argsort(probs)[-k:]
                mask = np.zeros_like(probs, dtype=bool)
                mask[top_k_indices] = True
                filtered_probs = probs.copy()
                filtered_probs[~mask] = 0
                filtered_probs = filtered_probs / filtered_probs.sum()
            else:
                filtered_probs = probs
            
            # 应用 Top-P
            sorted_indices = np.argsort(filtered_probs)[::-1]
            sorted_probs = filtered_probs[sorted_indices]
            cumsum_probs = np.cumsum(sorted_probs)
            cutoff = np.searchsorted(cumsum_probs, p) + 1
            nucleus_indices = sorted_indices[:cutoff]
            
            final_probs = np.zeros_like(filtered_probs)
            final_probs[nucleus_indices] = filtered_probs[nucleus_indices]
            final_probs = final_probs / final_probs.sum()
            
            # 显示结果
            print("\n最终概率分布:")
            for token, prob in zip(tokens, final_probs):
                if prob > 0.01:
                    bar = "█" * int(prob * 40)
                    print(f"  {token:6s}: {prob:6.3f} {bar}")
            
            # 采样几次看看效果
            print("\n采样结果 (5 次):")
            samples = []
            for _ in range(5):
                token_idx = np.random.choice(len(tokens), p=final_probs)
                samples.append(tokens[token_idx])
            print(f"  {samples}")
            
        except ValueError:
            print("退出交互演示")
            break
        except Exception as e:
            print(f"发生错误：{e}")
            continue


def plot_probability_distributions():
    """
    绘制概率分布对比图 (需要 matplotlib)
    """
    try:
        # 创建图表
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle('解码策略可视化对比', fontsize=16)
        
        # 模拟数据
        logits = np.array([3.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0, -0.5, -1.0, -1.5])
        tokens = [f'token_{i}' for i in range(len(logits))]
        x = np.arange(len(logits))
        
        # 子图 1: Temperature 影响
        ax1 = axes[0, 0]
        temps = [0.5, 1.0, 2.0]
        colors = ['#dc2626', '#2563eb', '#16a34a']
        
        for T, color in zip(temps, colors):
            probs = softmax_with_temperature(logits, T)
            ax1.bar(x, probs, alpha=0.6, color=color, label=f'T={T}', width=0.8)
        
        ax1.set_xlabel('Token')
        ax1.set_ylabel('Probability')
        ax1.set_title('Temperature 对概率分布的影响')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # 子图 2: Top-K 效果
        ax2 = axes[0, 1]
        probs_original = softmax_with_temperature(logits, 1.0)
        ax2.bar(x, probs_original, alpha=0.6, color='#93c5fd', label='Original', width=0.8)
        
        # K=3 的情况
        top_3_indices = np.argsort(probs_original)[-3:]
        probs_top3 = np.zeros_like(probs_original)
        probs_top3[top_3_indices] = probs_original[top_3_indices]
        probs_top3 = probs_top3 / probs_top3.sum()
        ax2.bar(x, probs_top3, alpha=0.8, color='#2563eb', label='Top-3', width=0.8)
        
        ax2.set_xlabel('Token')
        ax2.set_ylabel('Probability')
        ax2.set_title('Top-K 采样效果 (K=3)')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        # 子图 3: Top-P 效果
        ax3 = axes[1, 0]
        sorted_indices = np.argsort(probs_original)[::-1]
        sorted_probs = probs_original[sorted_indices]
        cumsum_probs = np.cumsum(sorted_probs)
        
        ax3.bar(range(len(sorted_probs)), sorted_probs, alpha=0.6, color='#93c5fd', width=0.8)
        ax3.plot(range(len(cumsum_probs)), cumsum_probs, 'r-', linewidth=2, label='Cumulative')
        ax3.axhline(y=0.9, color='red', linestyle='--', label='P=0.9 threshold')
        
        ax3.set_xlabel('Token (sorted)')
        ax3.set_ylabel('Probability / Cumulative')
        ax3.set_title('Top-P 采样原理 (P=0.9)')
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # 子图 4: 熵 vs Temperature
        ax4 = axes[1, 1]
        temp_range = np.linspace(0.1, 3.0, 50)
        entropies = []
        
        for T in temp_range:
            probs = softmax_with_temperature(logits, T)
            entropy = -np.sum(probs * np.log2(probs + 1e-10))
            entropies.append(entropy)
        
        ax4.plot(temp_range, entropies, linewidth=2, color='#7c3aed')
        ax4.fill_between(temp_range, 0, entropies, alpha=0.3, color='#7c3aed')
        
        ax4.set_xlabel('Temperature')
        ax4.set_ylabel('Entropy (bits)')
        ax4.set_title('分布熵随 Temperature 的变化')
        ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('decoding_strategies_comparison.png', dpi=300, bbox_inches='tight')
        print("\n✓ 图表已保存为 'decoding_strategies_comparison.png'")
        
    except ImportError:
        print("\n⚠ 未安装 matplotlib, 跳过图表绘制")


if __name__ == "__main__":
    print("\n" + "🎯" * 30)
    print("解码策略可视化实验平台")
    print("Temperature, Top-P, Top-K 详解")
    print("🎯" * 30)
    
    # 运行所有实验
    visualize_temperature_effect()
    compare_sampling_strategies()
    
    # 可选：交互演示
    run_interactive = input("\n是否运行交互演示？(y/n): ").strip().lower()
    if run_interactive == 'y':
        interactive_demo()
    
    # 可选：绘制图表
    try:
        import matplotlib
        plot_charts = input("\n是否绘制可视化图表？(需要 matplotlib, y/n): ").strip().lower()
        if plot_charts == 'y':
            plot_probability_distributions()
    except:
        pass
    
    print("\n" + "=" * 60)
    print("实验结束！")
    print("=" * 60)
    print("\n关键结论:")
    print("1. Temperature 控制分布的'锐度'——低温保守，高温冒险")
    print("2. Top-K 固定候选数量——简单高效但不够灵活")
    print("3. Top-P 动态选择候选——自适应但计算稍复杂")
    print("4. 实际使用推荐组合：Temperature + Top-P")
    print("\n默认推荐配置：T=0.7~1.0, Top-P=0.9, Top-K=50")
    print("=" * 60 + "\n")
