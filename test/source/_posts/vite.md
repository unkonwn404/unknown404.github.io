---
title: vite小记
date: 2024-09-02 15:36:19
categories:
  - 前端技术体系
tags:
  - 前端打包工具
---

记录一点 vite 的小知识

<!-- more -->

## 什么是 vite

一个新型前端构建工具，构建速度快于 webpack

## 概念区分：vite、webpack、vue-cli、create-vue

vue-cli、create-vue 都属于脚手架，作用是创建项目，选择性安装需要的插件，指定统一的风格，生成示例代码。区别在于：vue-cli 用于创建 vue2 的项目，使用 webpack 创建；create-vue 是 Vue3 的专用脚手架，使用 vite 创建。

webpack 属于打包代码：代码写好之后，为了更好的使用，需要打包处理一下。配置文件的 output 就是预期处理的结果

vite 属于构建项目：建立项目的运行环境，需要手动安装插件。打包代码只是构建项目的一环

## vite 特点

- 开发环境：使用 esbuild 打包代码，基于 原生 ES 模块 提供了 丰富的内建功能，如速度快到惊人的 模块热更新（HMR）
- 生产环境：使用 Rollup 打包代码，可预配置，最终输出用于生产环境的高度优化过的静态资源
- 插件生态：通过其 插件 API 和 JavaScript API 进行扩展，并提供完整的类型支持。例如支持 React、TypeScript

### vite 快速启动原因

1. 预构建：vite 会对 package.json 中的 dependencies 部分先进行构建，然后把构建后的文件换存在 node_modules/.vite 文件夹中，当启动项目时，直接请求该缓存内容。
2. esbuild：vite 利用了目前大部分浏览器都支持 es 模块化语法的特性，直接引入需要的 es 模块代码；es 模块具有动态引入的特点，实现了按需加载，因此页面的加载速度就提升了。
3. 热更新打包：不会像webpack一样更改了单个文件就重新打包后再传给server，而是监听到模块变化后让浏览器重新请求该模块

### vite的风险
1. 开发环境和线上环境的打包方式不一样，所以可能会出现线上版展示效果与开发版不一致的情况

## 参考文献

（1）[一篇文章说清 webpack、vite、vue-cli、create-vue 的区别](https://juejin.cn/post/7095603836072493086?searchId=20240902144719D7C75F0E69B15A07B83B)
（2）[一篇文章说清 webpack、vite、vue-cli、create-vue 的区别](https://juejin.cn/post/7095603836072493086?searchId=20240902144719D7C75F0E69B15A07B83B)
