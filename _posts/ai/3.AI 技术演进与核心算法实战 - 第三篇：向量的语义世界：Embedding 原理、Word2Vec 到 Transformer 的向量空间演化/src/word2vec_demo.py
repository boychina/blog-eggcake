import numpy as np
from typing import List, Dict

class SimpleWord2Vec:
    """
    一个极简的基于 NumPy 的 Skip-gram 模型实现。
    主要用于演示 Word2Vec 中词向量是如何通过梯度下降学习到的。
    不包含负采样或层次Softmax等工程优化。
    """
    def __init__(self, vocab_size: int, embedding_dim: int, learning_rate: float = 0.01):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.learning_rate = learning_rate
        
        # W1 是输入词矩阵 (V x D)，也就是最终的 Embedding 矩阵
        self.W1 = np.random.randn(vocab_size, embedding_dim) * 0.01
        # W2 是输出词矩阵 (D x V)
        self.W2 = np.random.randn(embedding_dim, vocab_size) * 0.01

    def forward(self, target_word_index: int):
        # 1. 查表（相当于 one-hot 乘以 W1）
        h = self.W1[target_word_index]
        # 2. 计算输出层的 logits
        u = np.dot(h, self.W2)
        # 3. Softmax
        y_pred = np.exp(u) / np.sum(np.exp(u))
        return h, u, y_pred

    def backward(self, target_word_index: int, context_word_index: int, h, y_pred):
        # 计算预测误差
        e = y_pred.copy()
        e[context_word_index] -= 1.0  # (y_pred - y_true)

        # 反向传播计算梯度
        dW2 = np.outer(h, e)
        dh = np.dot(self.W2, e)
        
        # 更新权重
        self.W2 -= self.learning_rate * dW2
        self.W1[target_word_index] -= self.learning_rate * dh

    def train_step(self, target_word_index: int, context_word_index: int):
        h, u, y_pred = self.forward(target_word_index)
        self.backward(target_word_index, context_word_index, h, y_pred)
        
        # 计算交叉熵损失
        loss = -np.log(y_pred[context_word_index])
        return loss

def get_cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

if __name__ == "__main__":
    # 演示：手动构造一个小语料库
    corpus = [
        ["the", "king", "is", "a", "man"],
        ["the", "queen", "is", "a", "woman"],
        ["a", "man", "is", "strong"],
        ["a", "woman", "is", "beautiful"]
    ]
    
    # 构建词汇表
    vocab = set(word for sentence in corpus for word in sentence)
    word2idx = {w: i for i, w in enumerate(vocab)}
    idx2word = {i: w for i, w in enumerate(vocab)}
    
    # 构建训练对 (Skip-gram, window_size=1)
    training_data = []
    for sentence in corpus:
        indices = [word2idx[w] for w in sentence]
        for i, target in enumerate(indices):
            # 前文
            if i > 0:
                training_data.append((target, indices[i-1]))
            # 后文
            if i < len(indices) - 1:
                training_data.append((target, indices[i+1]))
                
    # 训练模型
    model = SimpleWord2Vec(vocab_size=len(vocab), embedding_dim=10, learning_rate=0.05)
    epochs = 1000
    
    print("开始训练极简 Word2Vec 模型...")
    for epoch in range(epochs):
        total_loss = 0
        for target, context in training_data:
            loss = model.train_step(target, context)
            total_loss += loss
        if epoch % 200 == 0:
            print(f"Epoch {epoch}, Loss: {total_loss:.4f}")
            
    # 提取 Embedding
    embeddings = model.W1
    
    print("\n训练完成，测试余弦相似度:")
    vec_king = embeddings[word2idx["king"]]
    vec_queen = embeddings[word2idx["queen"]]
    vec_man = embeddings[word2idx["man"]]
    vec_woman = embeddings[word2idx["woman"]]
    
    print(f"king 与 queen 的相似度: {get_cosine_similarity(vec_king, vec_queen):.4f}")
    print(f"king 与 man 的相似度: {get_cosine_similarity(vec_king, vec_man):.4f}")
    print(f"queen 与 man 的相似度: {get_cosine_similarity(vec_queen, vec_man):.4f}")
    
    # 经典的 king - man + woman = queen
    # 我们这里语料太小，无法完美复现，但可以展示计算逻辑
    result_vec = vec_king - vec_man + vec_woman
    print(f"(king - man + woman) 与 queen 的相似度: {get_cosine_similarity(result_vec, vec_queen):.4f}")
