import re
from collections import defaultdict

class BasicBPETokenizer:
    def __init__(self):
        self.vocab = {}          # 词汇表：存储 id -> bytes 的映射
        self.merges = {}         # 合并规则：存储 (token1, token2) -> 新 token ID

    def get_stats(self, ids):
        """统计相邻 token ID 对的出现频率"""
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
        """训练分词器，构建词表与合并规则"""
        # 1. 初始阶段：将文本转化为基础字节（0-255）
        tokens = text.encode("utf-8")
        ids = list(tokens)
        
        # 初始化基础词表（0-255对应基础单字节）
        self.vocab = {idx: bytes([idx]) for idx in range(256)}
        
        num_merges = vocab_size - 256
        print(f"--- 开始训练：目标扩充词表大小 {vocab_size}，共需合并 {num_merges} 次 ---")
        
        # 2. 迭代合并
        for i in range(num_merges):
            stats = self.get_stats(ids)
            if not stats:
                print("找不到可合并的字符对，提前终止。")
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
            
            # 打印当前轮次合并信息
            try:
                token_str = self.vocab[new_idx].decode('utf-8')
            except UnicodeDecodeError:
                token_str = f"[Raw Bytes: {self.vocab[new_idx]}]"
                
            print(f"[{i+1}/{num_merges}] 合并 {best_pair} -> ID: {new_idx} (对应子词: '{token_str}')")

    def encode(self, text, verbose=False):
        """文本 -> Token IDs"""
        tokens = list(text.encode("utf-8"))
        
        if verbose:
            print(f"  [Encode] 初始字节拆分: {tokens}")
            print(f"  [Encode] 对应单字符为: {[chr(t) if 32 <= t <= 126 else '?' for t in tokens]}")
            
        while len(tokens) >= 2:
            stats = self.get_stats(tokens)
            # 找到在我们的 merges 规则中最先被合并的 pair
            # (因为较早合并的 pair 代表频率更高，优先级更大)
            pair = min(stats.keys(), key=lambda p: self.merges.get(p, float("inf")))
            
            if pair not in self.merges:
                break # 没有任何可合并的对了，退出循环
                
            idx = self.merges[pair]
            tokens = self.merge(tokens, pair, idx)
            
            if verbose:
                print(f"  [Encode] 应用合并规则 {pair} -> {idx}, 当前序列: {tokens}")
                
        return tokens

    def decode(self, ids):
        """Token IDs -> 文本"""
        tokens = b"".join(self.vocab[idx] for idx in ids)
        text = tokens.decode("utf-8", errors="replace")
        return text

if __name__ == "__main__":
    # 测试用例
    text_data = "hello world, hello python, hello AI! It is a beautiful world."
    print(f"训练语料:\n'{text_data}'\n")

    tokenizer = BasicBPETokenizer()
    # 训练：将词表大小从基础的 256 扩充到 270（执行 14 次合并）
    tokenizer.train(text_data, vocab_size=270)

    print("\n--- 测试 Encode (编码) 和 Decode (解码) ---")
    test_str = "hello AI!"
    
    encoded_ids = tokenizer.encode(test_str, verbose=True)
    decoded_text = tokenizer.decode(encoded_ids)
    
    print(f"1. 原始测试文本: '{test_str}'")
    print(f"2. 编码后的 IDs: {encoded_ids}")
    print(f"3. 解码还原文本: '{decoded_text}'")
    
    assert test_str == decoded_text, "解码结果与原始文本不一致！"
    print("\n✅ 测试通过：编码与解码完全可逆！")
