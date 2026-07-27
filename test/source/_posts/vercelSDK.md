---
title: Vercel SDK 初步解读
date: 2026-05-27 10:00:00
categories:
  - 工作技巧
tags:
  - Vercel
  - AI SDK
  - 流式渲染
excerpt: 记录 Vercel AI SDK 的核心组成、网关能力，以及在前端中如何做流式渲染。
---

最近在了解大模型能力时，发现Vercel AI SDK 是一个比较顺手的方案。它把「模型调用」「流式输出」「前端交互」这几块做了比较好的封装，适合快速搭建聊天、生成式内容和智能体类应用。

## 1. SDK 组成

如果把 Vercel AI SDK 理解成一个“前后端一体化的 AI 开发工具箱”，它大致可以拆成下面几层：

### 1.1 模型接入层

这一层负责对接不同厂商的大模型，比如 OpenAI、Anthropic、Google Gemini、DeepSeek 等。SDK 会把不同供应商的调用方式包装成统一接口，避免项目里到处写适配逻辑。

常见能力包括：

1. 统一的模型调用方式。
2. 统一的消息格式。
3. 统一的流式响应处理。

### 1.2 服务端能力层

服务端通常负责：

1. 持有密钥，避免把模型 Key 暴露到浏览器。
2. 做鉴权、限流、日志记录。
3. 统一处理工具调用、上下文拼接和错误兜底。

这一层一般会放在 Next.js API Route、Server Action，或者任意后端服务里。

### 1.3 前端交互层

前端负责把服务端返回的流式内容逐步渲染到页面上。Vercel AI SDK 在这一层提供了比较完整的 React Hook 和 UI 支持，例如：

1. `useChat`：管理消息列表、输入框、发送状态。
2. `useCompletion`：适合单轮文本补全场景。
3. `streamText` 相关能力：用于把模型输出变成可流式传输的数据。

### 1.4 一个典型调用链

可以把整个流程理解成下面这样：

```text
用户输入
  -> 前端发送请求
  -> 服务端组装上下文、调用模型
  -> 模型返回流式内容
  -> 服务端把流返回给前端
  -> 前端逐段渲染
```

这种分层的好处是很清晰：前端只关心展示，服务端只关心能力和安全，模型层只负责生成。

## 2. AI 网关

在系统架构中，前端用户发来的请求要先经过网关，网关会统一处理用户认证、拦截恶意请求、控制流量、监控统计请求等等，然后把请求转发到后端服务器进行处理。
而AI网关，可以理解为 AI SDK 生态里一层统一的模型访问入口。它的核心价值不是“再造一个模型”，而是把多家模型供应商的调用方式收拢到一个标准入口里。在用户向AI发送请求时AI 网关会完成用户鉴权、限流控制、安全防护、故障转移、负载均衡、监控统计等一系列复杂的操作，并且将请求转发给 AI 大模型进行处理。

### 2.1 为什么需要网关

如果项目里直接对接多个模型供应商，通常会遇到这些问题：

1. 每家厂商 API 形态不一样。
2. 流式返回格式不统一。
3. 工具调用、消息结构、错误处理都要重复适配。
4. 切换模型时，业务代码改动会很大。

网关层的作用，就是把这些差异抹平。

### 2.2 网关解决什么问题

1. 统一入口
   - 业务层只需要面向一个标准接口。
2. 统一鉴权
   - 密钥放在服务端，不暴露给客户端。
3. 统一转发
   - 根据业务配置选择不同模型供应商。
4. 统一观测
   - 更方便记录请求耗时、失败率和成本。

### 2.3 适合放在哪一层

一般建议把网关能力放在服务端，前端不要直接连模型供应商。

```ts
// 伪代码示意
export async function POST(req: Request) {
  const { messages } = await req.json();

  // 这里可以做鉴权、限流、日志、上下文拼接
  const result = await streamText({
    model: "your-model",
    messages,
  });

  return result.toDataStreamResponse();
}
```

这样做的好处是：

1. Key 更安全。
2. 更容易切模型。
3. 方便接入埋点、审计和缓存。

### 2.4 实际使用建议

如果你的项目是聊天机器人、智能写作、内容生成器这类场景，网关层最好再补上：

1. 请求频率限制。
2. 用户级别配额。
3. 敏感词或内容审查。
4. 模型降级策略。

这样即使模型服务不稳定，应用也不会直接“炸掉”。

对于不同项目，AI网关的需求度也是不一样的。
**个人项目**
只需要简单地调用单个 AI 模型，直接调用 API 就够了。
**个人或团队的小项目**
需要用到 AI 网关的特性（比如集成多个模型），可以选用 Vercel AI Gateway
**企业级应用**
对安全性和稳定性要求很高，选用 Higress 或者 Kong更合适

- Kong AI Gateway：Kong 本身就是一个很成熟的 API 网关，现在专门为 AI 场景做了增强，企业级功能比较完善。
- Higress AI：阿里云开源的 AI 网关，支持 100 多种大模型的统一协议转换，提供语义缓存、令牌限流、MCP 转换等企业级功能，适合有复杂 AI 集成需求的企业。
 我来帮你在 AI 网关部分增加一个关于 AI 网关和 AI 中转站区别的辨析。让我先看一下当前文档的结构，找到合适的位置插入内容。

 

Read [](file:///Users/danhuipeng/Desktop/githubLoad/unknown_404/test/source/_posts/vercelSDK.md#50-50), lines 50 to 120

Read [](file:///Users/danhuipeng/Desktop/githubLoad/unknown_404/test/source/_posts/vercelSDK.md#120-120), lines 120 to 160

现在我了解了文档结构。我将在 2.4 节之后、"## 3. 流式渲染"之前，新增一个 2.5 节来辨析 AI 网关和 AI 中转站的区别。

以下是建议插入的内容：

---

在 `## 2. AI 网关` 章节中，建议在 **2.4 实际使用建议** 之后、`## 3. 流式渲染` 之前，新增以下小节：

### 2.5 AI 网关 vs AI 中转站：概念辨析

在实际开发中，很多人容易把"AI 网关"和"AI 中转站"混为一谈，因为两者都涉及"请求转发"。但它们的定位、能力和适用场景有明显区别。

| 维度 | AI 网关 | AI 中转站 |
|------|---------|-----------|
| **核心定位** | 企业级流量治理与安全防护平台 | 轻量级 API 代理与密钥封装 |
| **主要功能** | 鉴权、限流、负载均衡、监控、熔断、灰度发布、协议转换 | 隐藏原始 API Key、统一请求路径、简单代理转发 |
| **安全能力** | 多层防护（WAF、敏感词过滤、内容审查、IP 黑白名单） | 仅隐藏 Key，无额外安全机制 |
| **可观测性** | 完整的链路追踪、指标采集、告警通知 | 基本无日志或仅有简单请求记录 |
| **模型管理** | 支持多模型路由、降级、权重分配、A/B 测试 | 通常只代理单一模型或固定几个接口 |
| **部署方式** | 独立部署，常作为基础设施层 | 轻量服务，可嵌入现有项目 |
| **典型代表** | Vercel AI Gateway、Kong、Higress、APISIX | 各类第三方中转 API 服务（如某些"免费代理"站点） |

#### 什么时候该用哪个？

**选 AI 中转站的场景：**
- 个人开发者想快速在项目中接入海外模型，又不想自己处理网络问题。
- 只需要隐藏 API Key，对安全、监控、限流没有额外要求。
- 项目规模小，成本敏感，不想引入复杂的基础设施。

> ⚠️ 注意：使用第三方中转站存在数据泄露风险——你的请求会经过对方服务器，敏感信息可能被记录或滥用。

**选 AI 网关的场景：**
- 团队或企业级应用，需要对 AI 调用做统一治理。
- 需要多模型切换、流量分发、熔断降级等高可用能力。
- 有合规要求，需要完整的审计日志和内容安全审查。
- 希望自建中转能力，同时保证数据不出内网。

#### 本质区别一句话总结

> **AI 中转站解决的是"能不能连上"的问题，AI 网关解决的是"怎么安全、稳定、可控地大规模使用"的问题。**


## 3. 流式渲染

Vercel AI SDK 最值得用的一点，就是流式渲染体验比较顺滑。对用户来说，最直观的感受就是“内容一边生成一边出现”，而不是等模型全部返回后一次性展示。

### 3.1 为什么要流式渲染

流式渲染有几个明显优势：

1. 首屏反馈更快。
2. 用户感知延迟更低。
3. 适合长文本生成和问答场景。
4. 更像真实对话体验。

### 3.2 服务端流式返回

服务端通常会把模型输出包装成流，再返回给前端。

```ts
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "your-model",
    messages,
  });

  return result.toDataStreamResponse();
}
```

这里的关键点不是某个具体函数名，而是思路：

1. 模型侧尽量以流的形式输出。
2. 服务端把流继续往前端透传。
3. 前端按增量更新 UI。

### 3.3 前端逐步渲染

前端可以通过 hook 维护消息状态，然后把模型返回的文本一点点拼到界面上。

```tsx
import { useChat } from "ai/react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <div>
      <div>
        {messages.map((message) => (
          <p key={message.id}>
            <strong>{message.role}:</strong> {message.content}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  );
}
```

### 3.4 流式渲染的几个细节

1. 需要处理断流和重试。
2. 需要处理首包延迟。
3. 需要处理“正在生成中”的状态展示。
4. 如果有 Markdown 渲染，要注意增量内容可能会导致局部语法不完整。

### 3.5 一个更贴近业务的思路

实际项目里，流式渲染通常不是只做“文字滚动显示”，而是还会配合：

1. 打字机效果。
2. 生成中骨架屏。
3. 思考状态提示。
4. 中途可停止生成。

这样用户会更明确地知道系统正在工作，也更符合 AI 产品的交互预期。

### 3.6 Streamdown-增量渲染md组件

Vercel 官方专门开源了一个库叫 streamdown，定位是"专为 AI 流式输出设计的 react-markdown 替代品"。
streamdown 相比 react-markdown 的核心改进是增量解析——普通 Markdown 解析器每次要拿到完整字符串才能渲染，streamdown 专门处理了流式场景下不完整语法的问题（比如 \*\*粗 还没闭合时不会乱跳）。streamdown用法如下所示：

```js
import { useChat } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code"; // 代码高亮插件
import { mermaid } from "@streamdown/mermaid"; // 流程图插件
import { math } from "@streamdown/math"; // 数学公式插件
import "streamdown/styles.css";

export default function Chat() {
  const { messages } = useChat();

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, i) =>
            part.type === "text" ? (
              <Streamdown
                key={i}
                plugins={[code, mermaid, math]} // 按需加插件
              >
                {part.text}
              </Streamdown>
            ) : null,
          )}
        </div>
      ))}
    </div>
  );
}
```

组件思路：

```
输入 Markdown (可能不完整)
    ↓
remend 预处理 (修复不完整语法)
    ↓
parseMarkdownIntoBlocks (分块)
    ↓
displayBlocks 状态更新 (useTransition)
    ↓
逐块渲染 (Block Component)
    ↓
最终 HTML 输出
```

#### 步骤 1: Remend 预处理不完整 Markdown

Remend 做什么？ 它会自动完成：

```md
**incomplete bold → **incomplete bold\*\*
*italic → *italic\*
`code → `code`
$$math → $$math$$
[link]( → [link](streamdown:incomplete-link)
```

#### 步骤 2: 分块解析 (Parse into Blocks)

分块的目的：

将 markdown 分成独立的逻辑块（段落、标题、代码块等）
处理嵌套 HTML 标签和数学公式
允许增量渲染

- Step 1: 特殊情况检查。检查文本是否有脚注，有的话不能分块
- Step 2: Marked Lexer 分解

```ts
const tokens = Lexer.lex(markdown, { gfm: true });
// Marked Lexer 生成 tokens，例如：
// [
//   { type: 'heading', raw: '# Heading\n' },
//   { type: 'paragraph', raw: 'Text\n' },
//   { type: 'space', raw: '\n' },
//   { type: 'heading', raw: '## Section\n' },
//   { type: 'paragraph', raw: 'More text\n' }
// ]

const mergedBlocks: string[] = [];
const htmlStack: string[] = [];
let previousTokenWasCode = false;

for (const token of tokens) {
  const currentBlock = token.raw; // ← 每个 token 的原始文本
  // ...
}
```

- Step 3: 后处理 - HTML 块合并。HTML 块可能跨越多个 token（嵌套标签），所以需要追踪开闭标签并合并
  示例：假设一个html结构分为了三段来传输。
  Token 1: <div>\n <p> ← openTags=2, closeTags=0 → htmlStack=['div','p']
  Token 2: Content ← 内部，合并
  Token 3: </p>\n</div> ← closeTags=2 → htmlStack=[]
  结果: 1 个块（整个 HTML 结构）
- Step 4: 后处理 - 数学块合并
#### 步骤 3: 状态管理与 useTransition

#### 步骤 4: 逐块渲染 (Block Component)
共享 animatePlugin 实例 - 所有块使用同一个插件
深度优先执行 - Block 函数 → rehypeAnimate → 记录字符数
状态传递 - 前一个块的 lastRenderCharCount → 下一个块的 prevContentLength
独立计算 - 每个块内的位置从 0 开始，与前一个块隔离
结果 - 新块的内容总是播放动画，旧块的内容跳过动画

## 参考文献

（1）[1分钟对接500个大模型？这才叫 AI 开发！](https://juejin.cn/post/7566167231128420362)
（2）[vercel AI SDK 学习](https://juejin.cn/post/7604761524977500169)
