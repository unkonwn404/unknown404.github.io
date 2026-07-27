---
title: agent架构知识
date: 2026-06-16 21:17:06
tags:
  - AI
  - Agent
---

## 1. Agent 模式

在大语言模型（LLM）驱动的智能体（Agent）设计中，有几种经典的推理与行动范式，每种范式在复杂任务处理上都有其独特的优势和局限性。

### ReAct (Reason + Act)

**运行特点：**
ReAct 结合了推理（Reasoning）和行动（Acting）。它引导模型以“Thought -> Action -> Observation”的循环方式运行。在每一步，Agent 会先写下当前的思考（Thought），决定采取什么行动（Action），然后观察执行结果（Observation），再进入下一次思考。

**局限性：**
- **LLM 依赖度高：** 极其依赖模型的逻辑推理和指令遵循能力，小模型容易出现格式错误或逻辑死循环。
- **效率较低：** 每一步都需要调用一次 LLM，且上下文随着步骤增加迅速膨胀，导致延迟和成本上升。
- **脆弱性：** 提示词（Prompt）的小变动可能导致模型输出格式崩坏，无法解析 Action。

### Plan-and-Solve (计划与执行)

**运行特点：**
这种模式将任务分为两个阶段：
1. **Planning（计划）：** 将复杂任务拆解为一系列子任务（Sub-tasks）。
2. **Execution（执行）：** 依次执行这些子任务。

**局限性：**
- **灵活性不足：** 预先制定的计划是静态的。如果任务执行过程中环境发生变化，或者某一步失败，传统的 Plan-and-Solve 很难自动调整，除非引入“重新计划（Re-planning）”机制。

### Reflection (反思)

**运行特点：**
Reflection 模式引入了自我修正机制。Agent 在生成初步结果后，会扮演“评价者”的角色对自己进行批判和检查（Reflection），识别事实错误或逻辑漏洞，然后根据反思结果进行改进（Refinement）。

**局限性：**
- **高成本/高延迟：** 为了获得最终答案，可能需要多次迭代，显著增加了 Token 消耗和响应时间。

---

## 2. 记忆系统

智能体的记忆系统参照了人类的认知结构，通常分为以下四类。

### 工作记忆 (Working Memory)

**特点：** 短期、任务相关、易失。主要用于维护当前对话的上下文。
**JS 实现思路：** 通常使用数组或具有容量限制的 LRU 缓存。

```javascript
class WorkingMemory {
    constructor(capacity = 10) {
        this.capacity = capacity;
        this.messages = [];
    }

    addMessage(role, content) {
        if (this.messages.length >= this.capacity) {
            this.messages.shift(); // 移除最早的消息
        }
        this.messages.push({ role, content });
    }

    getContext() {
        return this.messages;
    }
}
```

### 情景记忆 (Episodic Memory)

**特点：** 长期存储具体的事件、经历和交互序列。通常用于“搜索类似经历”。
**JS 实现思路：** 结合向量数据库（如 Qdrant）和结构化数据库（如 SQLite）。检索时通常考虑：`Score = Similarity * w1 + Recency * w2 + Importance * w3`。

```javascript
// 伪代码：存储情景
async function saveEpisodicMemory(event) {
    const embedding = await getEmbedding(event.summary);
    await vectorDB.add({
        id: event.id,
        vector: embedding,
        payload: { ...event, timestamp: Date.now() }
    });
}
```

### 语义记忆 (Semantic Memory)

**特点：** 存储抽象的知识、事实和概念关系（例如：用户喜欢 JavaScript）。
**JS 实现思路：** 常结合向量数据库与图数据库（如 Neo4j），通过实体抽取建立知识图谱。

```javascript
// 伪代码：更新语义知识
async function updateSemanticMemory(userId, fact) {
    // 将“用户喜欢 Python” 转化为三元组 [User, LIKES, Python]
    const triples = await extractTriples(fact); 
    await graphDB.mergeTriples(triples);
}
```

### 感知记忆 (Perceptual Memory)

**特点：** 处理多模态数据，如图像、音频、视频的原始感知信号。
**JS 实现思路：** 使用多模态模型（如 CLIP）将不同媒介转化为统一的向量表示。

```javascript
// 伪代码：处理图像感知
import { pipeline } from '@xenova/transformers';

async function processImage(imagePath) {
    const featureExtractor = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');
    const output = await featureExtractor(imagePath);
    // 存入专门的感知向量集合
    await vectorDB.collection('perceptual').add(output.data);
}
```

---

## 总结

- **模式选择：** 简单动态任务选 **ReAct**，复杂长链路任务选 **Plan-and-Solve**，高质量严谨任务选 **Reflection**。
- **记忆集成：** 完整的 Agent 通常需要 **工作记忆** 维持对话，**情景记忆** 回溯经验，**语义记忆** 沉淀知识，以及 **感知记忆** 理解多模态世界。

