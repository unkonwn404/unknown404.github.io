---
title: babel初识
date: 2024-02-04 11:11:17
categories:
  - 技术学习
tags:
  - babel
  - 前端编译
---

了解一下 babel 相关配置

<!-- more -->

## 背景介绍

babel 最初是用于 es6 转 es5，确保各端浏览器能支持代码逻辑的运行。但现在 babel 作为转译器，还可以实现其他的功能

## babel 作用

### 转译 es、typescript、flow 等到目标环境支持的 js

这个是最常用的功能，用来把代码中的 es 的新的语法、typescript 和 flow 的语法转成基于目标环境支持的语法的实现。并且还可以把目标环境不支持的 api 进行 polyfill。

babel7 提供了 @babel/preset-env 的包，可以指定目标 env 来按需转换，转换更加的精准，产物更小。

### 一些特定用途的转换

比如函数插桩（函数中自动插入一些代码，例如埋点代码）、自动国际化等。

### 代码的静态分析

对代码进行 parse 之后，会生成 AST，通过 AST 能够理解代码结构，除了转换 AST 再打印成目标代码之外，也同样可以用于分析代码的信息，进行一些静态检查。例如：

- linter 工具就是分析 AST 的结构，对代码规范进行检查。
- api 文档自动生成工具，可以提取源码中的注释，然后生成文档。
- ...

## babel 配置的方式

- babel.config.json：在项目的根目录（package.json 文件所在的目录）下
- .babelrc.json：在项目的根目录（package.json 文件所在的目录）下
- @babel/cli

三种配置方式的权重排序（由小到大） babel.config.json < .babelrc < programmatic options from @babel/cli

## 常用 babel 配置

babel 中插件可配置两个属性——presets 和 plugins，应用顺序是：先 plugin 再 preset，plugin 从左到右，preset 从右到左。

### presets

一般情况下一个插件用来解决一个语法转译问题，例如@babel/plugin-transform-arrow-functions 可以用于箭头函数转为一般函数，@babel/plugin-transform-destructuring 则用于将 es6 的解构语法进行转译。而 presets 可以理解为官方预置的 es 的新的语法、typescript 和 flow 的语法转译为目标环境支持语法的插件的集合，省去了我们一个个引入插件的麻烦。
babel 官方目前提供的预设包括：

- @babel/preset-env (转译 es 6+语法)
- @babel/preset-typescript （转译 ts 语法）
- @babel/preset-react （转译 react 语法）
- @babel/preset-flow （转译 flow 语法）

### plugins

常用的插件有：

#### @babel/plugin-transform-runtime

转译 class 语法时 babel 注入了一些辅助函数的声明，以便语法转换后使用。但如果多个文件都使用了 class 语法，转译时这些辅助函数都会在转换文件里定义，尽管函数功能是相同的
plugin-transform-runtime 则是可以将 helper 和 polyfill 都改为从一个统一的地方引入，并且引入的对象和全局变量是完全隔离的

#### @babel/plugin-proposal-decorators

转译 js 装饰器语法

#### babel-plugin-import

模块化导入插件，可以实现按需引入依赖包模块
使用示例：
使用指令`npm install babel-plugin-import --save-dev`安装该依赖后对 babel 配置文件进行如下配置

```
{
  plugins: [
    ["import", {
      "libraryName": "antd", // 指定导入包的名称
      "libraryDirectory": "lib", // 指定模块的存放目录
      style: "css", // 导入 css 样式
    }]
  ]
}
```

不过理论上新版的 antd 和 material-ui 中，默认已支持基于 ES modules 的 tree shaking 功能；而打包工具如：Webpack、Rollup 等在打包层面也支持了 [tree shaking](https://juejin.cn/post/7298966922329554995?searchId=20240206112751FE48D0DEEA2D4405759C)，使得我们不需要额外配置 babel-plugin-import 也能实现按需引入

## babel 编译流程

整体编译流程主要分为三步：

- parse：通过 parser 把源码转成抽象语法树（AST）
- transform：遍历 AST，调用各种 transform 插件对 AST 进行增删改
- generate：把转换后的 AST 打印成目标代码，并生成 sourcemap

## 参考文献

（1）[一文轻松掌握 babel](https://juejin.cn/post/7049160361173319693?from=search-suggest)
（2）[Babel 教程 11：@babel/plugin-transform-runtime](https://zhuanlan.zhihu.com/p/394783228?utm_id=0)
