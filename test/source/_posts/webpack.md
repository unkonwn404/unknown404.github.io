---
title: webpack
date: 2023-02-19 14:44:52
categories:
  - 前端基础
tags:
  - webpack
---

前端 webpack 打包工具方面知识整理。

<!-- more -->

## webpack 基本概念

### webpack 作用

静态模块打包工具。主要作用：

- 模块打包。可以将不同模块的文件打包整合在一起，并且保证它们之间的引用正确，执行有序。
- 编译兼容。通过 webpack 的 Loader 机制，编译转换诸如.less，.vue，.jsx 这类在浏览器无法识别的格式文件
- 能力扩展。通过 webpack 的 Plugin 机制，我可以进一步实现诸如按需加载，代码压缩等一系列功能

### webpack 构建流程

初始化：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler
编译：从 entry 出发，针对每个 Module 串行调用对应的 loader 去翻译文件的内容，再找到该 Module 依赖的 Module，递归地进行编译处理
输出：将编译后的 Module 组合成 Chunk，将 Chunk 转换成文件，输出到文件系统中

### loader 和 plugin 区别

- 功能方面：loader 是文件加载器，能够加载资源文件，并对这些文件进行一些处理；plugin 可以扩展 Webpack 的功能，监听在 Webpack 运行的生命周期中会广播出的许多事件并做处理，解决 loader 无法实现的其他事。
- 运行时机方面：loader 运行在打包文件之前；plugin 则是在整个编译周期都起作用。
- 配置书写方面：loader 在 module.rules 中配置，作为模块的解析规则，类型为数组，内部包含了 test(类型文件)、loader、options (参数)等属性需要配置。plugin 在 plugins 中单独配置，类型为数组，每一项是一个 plugin 的实例，参数都通过构造函数传入。

### webpack 热更新原理

webpack-dev-server 与浏览器之间维护了一个 websocket，当本地资源发生变化时，webpack-dev-server 会向浏览器推送更新，并带上构建时的 hash，让客户端与上一次资源进行对比。客户端对比出差异后会向 webpack-dev-server 发起 Ajax 请求来获取更改内容。后续的部分(拿到增量更新之后如何处理？哪些状态该保留？哪些又需要更新？)由 HotModulePlugin 来完成

## 参考文献

（1）[2023 前端面试系列-- webpack & Git 篇](https://juejin.cn/post/7196630860811075642)
