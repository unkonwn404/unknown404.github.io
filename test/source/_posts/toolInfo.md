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

## Charles

Charles 是一款功能强大的网络抓包工具，支持 HTTP 和 HTTPS 协议的抓取。使用流程大致如下：

1. 安装：访问官网https://www.charlesproxy.com/download/ 下载 mac 包，下载完后点击安装按照指示操作即可。
2. 认证 ‌：为了解密 HTTPS 流量，需要在电脑上安装 Charles 的根证书。在 Charles 中，依次点击 Help > SSL Proxying > Install Charles Root Certificate。点击后输入密码进入钥匙串，在“证书”-“系统根证书”一栏找到 charles 的证书，此时它应该还未被信任，点击进入后调整信任的选项，完成离开后会再次要求输入密码。
3. 配置 SSL 代理 ‌：安装证书后，需要设置 Charles 对哪些 HTTPS 地址进行代理。可以在 Charles 界面、对抓包域名单击右键，选择「Enable SSL Proxying」

## madge

做部分组件迁移时总需要对组件依赖进行一个大致分析，确认大致有多少工作量，这个时候就可以利用 madge 做依赖分析。
madge 是一个用来 分析模块依赖关系 的命令行工具，可以帮你：

- 可视化文件依赖图（生成图谱 PNG/SVG）
- 检测循环依赖（circular dependencies）
- 检测未使用模块
- 分析 entry → dependency tree

**需要注意的点是：**

1. 默认状态下无法解析你的业务 alias，需要配置--webpack-config
   madge 对 Webpack config 有要求：

- 不能是函数（需要写成纯对象）
- 不能依赖 process.env 注入 loader
- 不能用 import（必须是 module.exports =）
  如果你的 webpack.config 是函数，你可以 创建一个专用于 madge 的简化版配置。

2. madge 默认只解析 js，如果要解析 vue 需要配置--extensions js,vue

示例：

```bash
madge src/components/member \
  --extensions js,vue \
  --webpack-config build/webpack.base.js \
  --json > member-components-deps.json

```

3. madge 输出所有“依赖树上的文件”，而不是你指定目录里的文件——只要被引用到，madge 就会写入结果。例如 member 目录里的文件引用了其它目录（比如 common、global、mixins、utils）这种 madge 会自动展开。
4. 只安装 madge 是无法输出依赖图片的，需要 Graphviz，安装指令

```bash
brew install graphviz || port install graphviz
```

## 参考文献

（1）[React 项目里，如何快速定位你的组件源码？](https://juejin.cn/post/7374631918111178790)
（2）[Charles 抓包神器的使用，完美解决抓取 HTTPS 请求 unknown 问题](https://cloud.tencent.com/developer/article/2427128)

（3）[madge](https://github.com/pahen/madge)
