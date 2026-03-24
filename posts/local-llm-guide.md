## 🤔 为什么要本地部署？

云端 API 方便，但本地部署有不可替代的优势：

- **隐私**：数据不出本机，处理敏感内容无顾虑
- **零延迟**：没有网络开销，响应速度取决于硬件
- **无限调用**：不受 API 额度和限流限制
- **离线可用**：断网也能跑
- **可定制**：随意微调、修改模型

## 💻 硬件需求

| 模型大小 | 显存需求 (FP16) | 显存需求 (4-bit) | 推荐显卡 |
|----------|-----------------|------------------|----------|
| 7B | 14 GB | 4 GB | RTX 3060 12GB |
| 13B | 26 GB | 8 GB | RTX 4070 Ti |
| 70B | 140 GB | 35 GB | 2× RTX 4090 |

没有显卡？CPU 推理也可以，就是慢一些。16GB 内存能跑 7B 量化模型。

## 🛠️ 方案一：Ollama（最简单）

Ollama 是目前最简单的本地部署方案，一行命令搞定：

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取并运行模型
ollama run qwen2.5:7b

# 直接开始对话
>>> 你好，介绍一下你自己
```

## 🛠️ 方案二：llama.cpp（更多控制）

```bash
# 克隆并编译
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
cmake -B build && cmake --build build --config Release

# 运行推理
./build/bin/llama-cli \
  -m models/qwen2.5-7b-q4_k_m.gguf \
  -p "用 Python 写一个快排" \
  -n 512 \
  --temp 0.7
```

## 🛠️ 方案三：vLLM（高性能服务）

```bash
# 安装
pip install vllm

# 启动 OpenAI 兼容的 API 服务
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --tensor-parallel-size 1 \
  --port 8000
```

## 📊 量化详解

量化是用更少的比特表示模型权重，是本地部署的关键技术：

- **GGUF Q4_K_M** — 4-bit，质量与大小的最佳平衡 ⭐推荐
- **GGUF Q5_K_M** — 5-bit，质量更好，体积更大
- **GGUF Q8_0** — 8-bit，接近原始质量
- **GPTQ 4-bit** — 需要 GPU，速度更快
- **AWQ 4-bit** — 另一种 GPU 量化方案

## ⚙️ 推理优化技巧

### Flash Attention

加速注意力计算，减少显存：

```bash
# vLLM 默认启用
# llama.cpp 编译时加 -DGGML_CUDA=on 自动支持
```

### 投机解码 (Speculative Decoding)

用小模型预测，大模型验证，加速 2-3 倍：

```bash
llama-cli -m large-model.gguf -md small-model.gguf
```

## 📈 性能基准

| 配置 | 模型 | tokens/s | 显存占用 |
|------|------|----------|----------|
| RTX 4090 | Qwen2.5-7B Q4 | ~85 | 5.2 GB |
| RTX 4090 | Qwen2.5-7B FP16 | ~60 | 14.5 GB |
| M2 Max 64GB | Qwen2.5-7B Q4 | ~35 | 4.8 GB |
| CPU (i7-13700K) | Qwen2.5-7B Q4 | ~8 | 5.0 GB RAM |

## 🚀 总结

推荐的入门路径：

1. 安装 **Ollama** → 5 分钟跑起来
2. 选 **Q4_K_M 量化**的 7B 模型 → 够用且省内存
3. 装 **Open WebUI** → 获得类 ChatGPT 体验
4. 需要 API → 用 **vLLM** 部署

> 💡 **推荐模型：**Qwen2.5 系列在中文任务上表现出色，7B 版本是性价比之王。
