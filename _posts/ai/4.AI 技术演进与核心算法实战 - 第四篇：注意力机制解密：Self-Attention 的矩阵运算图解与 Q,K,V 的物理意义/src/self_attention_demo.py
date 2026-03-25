import torch
import torch.nn as nn
import torch.nn.functional as F

class SelfAttention(nn.Module):
    def __init__(self, embed_size):
        super(SelfAttention, self).__init__()
        self.embed_size = embed_size
        
        # 定义生成 Q, K, V 的线性映射
        self.W_q = nn.Linear(embed_size, embed_size, bias=False)
        self.W_k = nn.Linear(embed_size, embed_size, bias=False)
        self.W_v = nn.Linear(embed_size, embed_size, bias=False)
        
    def forward(self, x):
        # x shape: (batch_size, seq_len, embed_size)
        
        # 1. 计算 Q, K, V
        Q = self.W_q(x)  # (batch_size, seq_len, embed_size)
        K = self.W_k(x)  # (batch_size, seq_len, embed_size)
        V = self.W_v(x)  # (batch_size, seq_len, embed_size)
        
        # 2. 计算注意力分数: Q 和 K^T 的点积
        # K.transpose(1, 2) 将 seq_len 和 embed_size 维度互换
        attention_scores = torch.matmul(Q, K.transpose(1, 2)) 
        
        # 3. 缩放 (Scaling)
        d_k = self.embed_size
        scaled_attention_scores = attention_scores / (d_k ** 0.5)
        
        # 4. Softmax 归一化，得到注意力权重
        attention_weights = F.softmax(scaled_attention_scores, dim=-1)
        
        # 5. 加权求和得到输出
        output = torch.matmul(attention_weights, V)
        
        return output, attention_weights

if __name__ == "__main__":
    # 模拟输入：批次大小 1，序列长度 3（3个词），词向量维度 4
    x = torch.rand(1, 3, 4)
    print("输入 X:\n", x)
    
    attention = SelfAttention(embed_size=4)
    output, weights = attention(x)
    
    print("\n注意力权重 (Attention Weights):\n", weights)
    print("\n输出 Output:\n", output)