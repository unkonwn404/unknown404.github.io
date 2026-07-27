---
title: SSE接入web、小程序
date: 2025-05-21 17:49:21
categories:
  - 工作技巧
tags:
  - sse
  - 小程序
  - WEB API
---

最近调用智能体的方式做出了调整，变更为 SSE 方式。

## 什么是 SSE

SSE（Server-Sent Events）是一种浏览器原生支持的服务端向客户端推送数据的技术，非常适合用于实现流式响应。整个响应流程如下：

1. 客户端通过发送一个普通的 HTTP 请求建立连接。
2. 服务端返回一个 Content-Type: text/event-stream 的响应。
3. 后续服务端可以不断往这个连接中推送数据流（保持连接不断）。
4. 客户端通过监听事件流不断接收数据。

## 浏览器实现 SSE

虽然浏览器提供了原生 API： EventSource，可以通过以下代码来接收服务器数据，但是它不支持发起 POST 请求，如果考虑发送数据以及处理请求一些状态，最好还是用 xhr 或者 fetch

```js
const eventSource = new EventSource("http://localhost:3000");

eventSource.addEventListener("message", (event) => {
  console.log("收到消息:", event.data);
  document.getElementById("messages").innerHTML += `<p>${event.data}</p>`;
});

eventSource.onopen = () => console.log("连接已打开");
eventSource.onerror = () => {
  console.error("连接中断，将自动重连");
};
```

使用 fetch 时数据处理流程如下：

```js
import { TextDecoder } from "text-encoding-shim";

async function fetchData() {
  try {
    const response = await fetch("https://xxx.com/getData");
    const isStream =
      response.headers?.get("Content-Type") == "text/event-stream";
    if (isStream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, {
          stream: true,
        });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonData = JSON.parse(line.substring(5).trim());
              processNewData(jsonData);
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
```

处理流程包括以下几个步骤：

1. 读取返回头 Content-Type，确认是 sse 数据
2. 新建文本解码器（Uint8Array -> 字符串），循环读取返回内容，直到标志位 done 指示结束
3. 根据与后端商议的规则按行（\n）拆分数据，并保留最后一行不完整内容（如果存在）继续拼接。
4. 提取 data: 后的内容，尝试 JSON.parse() 并传给 processNewData() 做进一步处理

### SSE 格式参考

```md
event:message
data:{"id":"chatcmpl-Bp4ua73uKkcPSoa8QXdkNC1v12HOO","model":"gpt-4o-mini-2024-07-18","object":"chat.completion","choices":[{"index":0,"delta":{"content":"**"}}],"created":1751513308,"system_fingerprint":"fp_efad92c60b"}

event:message
data:{"id":"chatcmpl-Bp4ua73uKkcPSoa8QXdkNC1v12HOO","model":"gpt-4o-mini-2024-07-18","object":"chat.completion","choices":[{"index":0,"delta":{"content":"视频"}}],"created":1751513308,"system_fingerprint":"fp_efad92c60b"}
```

## 小程序实现 SSE

```js
function fetchData() {
  const requestTask = wx.request({
    url: `https://xxx.com/getData`,
    enableChunked: true, // 开启分块接收
    success(res) {
      console.log("Request succeeded", res);
    },
    fail(err) {
      if (err?.errMsg.includes("abort")) return; // 手动停止的话，则不再进入catch
      console.error("Request failed:", err);
      onError(err);
    },
  });
  const chunkFn = (chunk) => {
    if (store.state.root.isStop) {
      requestTask?.abort();
      requestTask?.offChunkReceived(chunkFn);
      return;
    }

    const uint8Array = new Uint8Array(chunk.data); // 将二进制数据转换为 Uint8Array

    const text = decoder.decode(uint8Array, {
      stream: true,
    }); // 解码为字符串
    buffer += text; // 将新数据追加到缓存区
    // 按行分割数据
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // 保留未处理完的数据

    let jsonBuffer = {};
    if (buffer) {
      try {
        jsonBuffer = JSON.parse(buffer);
      } catch (error) {
        console.log("error", error);
      }
    }
    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          const jsonData = JSON.parse(line.substring(5).trim());
          processNewData(jsonData);
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      }
    }
  };
  // 监听分块数据
  requestTask.onChunkReceived(chunkFn);
  return requestTask;
}
```

小程序的处理流程和浏览器类似，需要的注意的有几点：

1. enableChunked 需要设置为 true，onChunkReceived 设置数据处理，这样就可以分块处理数据
2. chunk 数据是二进制，需要用 Uint8Array 处理
3. 微信小程序 requestTask.abort 不知道为什么放在同步代码不容易生效，需要放回调里

## 参考文献

（1）[现在公司的 AI 部门的前端面试这么离谱吗？](https://juejin.cn/post/7502268562096160768)
（2）[uniapp 在微信小程序中实现 SSE 流式响应](https://juejin.cn/post/7493579575848271887)
（3）[从SSE到打字机——AI场景下前端的实现逻辑与实践](https://aicoding.juejin.cn/post/7521792361309372416)
