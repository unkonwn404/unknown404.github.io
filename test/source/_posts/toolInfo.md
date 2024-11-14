---
title: 工具随记
date: 2024-08-01 17:20:18
categories:
  - 工作技巧
tags:
  - Postman
---

随手记一下一些工具小技巧

<!-- more -->

## Chrome

（一）接口数据 mock
Chrome 117 优化了本地覆盖功能，因此可以在没有访问权限的情况下，通过 Network 面板轻松模拟远程资源的响应头和网页内容。

要覆盖网页内容，需要打开 Network 面板，右键点击一个请求，然后选择“Override content”。在 DevTools 中会自动定位到 Sources 标签下请求的文件位置，修改后保存刷新即可 mock 成功。

如果要取消覆盖内容，仍然是 Sources 标签下操作：要暂时禁用覆盖，取消选中 Enable Local Overrides 复选框；要取消全部覆盖，则点击 Enable Local Overrides 选项右侧的 Clear 图标找到修改的文件位置；若取消单个覆盖，则是将修改的文件选中后右键点击，在菜单中选中删除

（二）手机 ua 模拟

## Postman

（一） 将 Postman 请求转换为 cURL

1. 打开 Postman 并选择你要转换的请求。
2. 点击右上角的“Code”按钮（有时显示为 </> 图标）。
3. 在弹出的窗口中选择“cURL”。
4. 复制生成的 cURL 命令，可以将其粘贴到终端或命令行中执行。

（二）读取 cURL 格式的请求

1. 打开 Postman。
2. 点击左上角的“Import”按钮。
3. 选择“Raw text”选项。
4. 粘贴你的 cURL 命令，然后点击“Continue”。
5. 点击“Import”按钮，Postman 会自动解析并导入该请求

## React

（一）定位组件代码
npm 安装 click-to-react-component，在 main.tsx 引入：

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// @ts-ignore
import { ClickToComponent } from 'click-to-react-component';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
        <ClickToComponent />
        <App />
    </>
)
```

按住 option + 单击，就会直接打开它的对应的组件的源码；按住 option + 右键单击，可以看到它的所有父级组件

## 参考文献

（1）[React 项目里，如何快速定位你的组件源码？](https://juejin.cn/post/7374631918111178790)
