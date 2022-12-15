---
title: rollup打包工具使用
date: 2022-08-08 20:14:13
categories:
  - 前端技术体系
tags:
  - rollup
  - 前端打包工具
---

rollup 使用指南和相关知识梳理。

<!-- more -->
<!-- toc -->

## rollup 概述

rollup 是一个 js 模块打包器。与 webpack 相比，rollup 更适合打包库，而 webpack 适合打包项目；同体积的代码条件下 rollup 打包的代码体检要小于 webpack。rollup 对于代码的 Tree-shaking 和 ES6 模块有着先天的算法优势上的支持，而 webpack 在代码分割、静态资源导入及热模块替换(HMR)有着更多优势。

## rollup 使用

### 安装 rollup 工具

创建一个新的空工程，打开命令行执行`npm install --global rollup `指令。指令执行完成后项目的结构变为：

```
├── node_modules
└── package.json
```

此时工程里已经预装了一些插件，允许我们用 cli 命令来打包。但复杂的工程中这种方式就比较麻烦。所以需要配置文件。

### 配置打包文件

```es6
import babel from "@rollup/plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import size from "rollup-plugin-sizes";
import { terser } from "rollup-plugin-terser";
import cleanup from "rollup-plugin-cleanup";

export default {
  input: "./index.js",
  output: [
    {
      file: "./dist/dofin.js",
      format: "umd",
      name: "DOFIN",
    },
    {
      file: "./dist/dofin.min.js",
      format: "iife",
      name: "DOFIN",
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve(),
    size(),
    cleanup({
      comments: "none",
    }),
    babel({
      babelHelpers: "runtime",
      exclude: "node_modules/**",
    }),
    commonjs(),
  ],
};
```

以上述某一配置文件 rollup.config.js 为例，该文件通常需要需要的核心参数包括：

#### input

打包文件入口

#### output

文件输出配置

- **file** 表示输出文件的路径
- **format** 表示输出的格式
- **name** 当 format 为 iife 和 umd 时必须提供，将作为全局变量挂在 window(浏览器环境)下：window.A=...

#### plugins

使用的插件

#### external

使用的外部依赖，不会被打包进输出文件

#### global

```
global:{
    'jquery':'$' //告诉rollup 全局变量$即是jquery
}
```

### 执行打包指令

可以直接在执行终端输入`rollup -c`默认执行 rollup.config.js 文件，也可以在 package.json 文件里的 scripts 属性配置指令：

```
{

  "scripts": {
    "build-browser": "rollup --config browser.rollup.config.js ",
、  },
  "dependencies": {
    "@babel/runtime": "^7.14.6",
    "@rollup/plugin-json": "^4.1.0",
    "rollup-plugin-cleanup": "^3.2.1",
    "rollup-plugin-sizes": "^1.0.4",
    "tti-polyfill": "^0.2.2"
  }
}

```

rollup 指令命令行常用的参数包括：

- `-c`。指定 rollup 的配置文件。
- `-w`。监听源文件是否有改动，如果有改动，重新打包。
- `-f`。-f 参数是--format 的缩写，它表示生成代码的格式。
- `-o`。-o 指定了输出的路径
  执行`npm run build-browser`即可打包完成，控制台会显示输出结果

## 输出代码格式说明

通过配置文件，我们可以指定其输出 amd , cjs , esm , iife , umd , system 六种格式的文件。

### amd

"Asynchronous Module Definition"的缩写，意思就是"异步模块定义"。
打包后的代码其核心内容是一个全局方法 define。

define 方法可以有三个入参，以文章[说不清 rollup 能输出哪 6 种格式 😥 差点被鄙视](https://juejin.cn/post/7051236803344334862)中的代码为例，分别是：

- 模块名称 Test，如果没有指定不会出现
- [exports, lodash] 分别表示模块的输出和外部依赖
- 代表模块的实际内容的一个匿名函数，一个以 exports 和 lodash 作为入参的方法。

#### 运行方法

调用打包后的模块内容时，需要执行以下操作：

1. 在浏览器内引入 require.js
2. 通过 requirejs.config 方法定义全局的依赖
3. 通过 requirejs.define 注册模块
4. 通过 requirejs() 完成模块引入

#### 适合场景

只需要在浏览器端使用的场景。

### cjs

CommonJS 标准。是为了解决 node.js 在模块化上的缺失， 于 2009 年 10 月提出。所以并不能用于浏览器上。

#### 运行方法

js 文件里使用 require 方法引入打包文件

#### 适合场景

只需要在服务器端使用的场景。

### esm

遵循 es6 模块化语法，通过 export 命令显式指定输出的代码，再通过 import 命令输入。

#### 运行方法

如果需要在浏览器上使用，需要用`<script type="module">`标签才能支持模块引入语法，用`import ... from ...`导入代码。

#### 适合场景

1. 还会被引用、二次编译的场景（如组件库等）
2. 浏览器调试场景如 vite.js 的开发时
3. 对浏览器兼容性非常宽松的场景。

### iife

IIFE 的全称是 “immediately invoked function expression”，即自执行函数。打包出来是一个匿名函数，对外部的依赖通过入参的形式传入该函数

#### 运行方法

如果它没有其他依赖，只需要去引入文件，然后在 window 上取打包时命名的模块名即可。

jquery 就是典型的自执行函数模式，当你引入`http://cdn.bootcss.com/jquery/3.3.1/jquery.min.js`文件后，它就会挂在到 window.$ 上，可以直接在 js 文件使用 jquery 语法如`$('.input').addClass('test')`

#### 特点

**优点：**

- 通过闭包营造了一个“私有”命名空间，防止影响全局，并防止被从外部修改私有变量。
- 简单易懂
- 对代码体积的影响不大
  **缺点：**
- 输出的变量可能影响全局变量；引入依赖包时依赖全局变量。
- 需要使用者自行维护 script 标签的加载顺序。

#### 适合场景

适合部分场景作为 SDK 进行使用，尤其是需要把自己挂到 window 上的场景。

### umd

umd 主要是处理兼容性问题，可以让模块同时兼容让模块同时兼容 AMD、CommonJs 和浏览器变量挂载的规范。

#### 运行方法

- 在浏览器端，它的运行方式可以和 amd 完全一致，也可以采用 iife 的调用方式
- 在 node.js 端，它则和 CommonJS 的运行方式完全一致

#### 适合场景

既可能在浏览器端也可能在 node.js 里使用的场景

### system

采用了 SystemJS 代码语法。由于很少使用该语法，这里暂时不展开。

## 常用插件

### resolve 插件

#### 安装指令

```
npm i -D @rollup/plugin-node-resolve
```

**注释**

```
 i  是 install 的简写
-S 就是 --save 的简写，安装的插件会被写入到 dependencies 区块里面去，在生产环境也存在对该包的依赖
-D 就是 --save-dev 的简写， 安装的插件会被写入到 devDependencies 域里面去，即插件只用于开发环境
```

#### 作用

将我们编写的源码与依赖的第三方库代码进行合并，打包后的代码里会出现引用模块的代码。在使用 resolve 模块下，如果希望依赖的模块不被打包，保持外部引用状态时，就需要 config 文件使用 external 属性，来告诉 rollup.js 哪些是外部的类库。

### commonJs 插件

#### 安装指令

```
npm i -D @rollup/plugin-commonjs
```

#### 作用

rollup 编译源码中的模块引用默认只支持 ES6+的模块方式 import/export。然而大量的 npm 模块是基于 CommonJS 模块方式，为支持这些模块的引入，支持 commonjs 语法的插件应运而生。

### babel 插件

#### 安装指令

```
npm i -D @rollup/plugin-babel
```

安装完成后在根目录文件夹下添加.babelrc 文件，配置内容

```

{
  // 开启默认预设
  "presets": [
    [
      "@babel/env",
      {
        "modules": false  // 关闭 esm 转化，统一交由 rollup 处理，防止冲突
      }
    ]
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

完成后安装插件安装@babel/core 和 @babel/preset-env

#### 作用

将代码中的 es6 语法转为 es5，防止打包后的模块在部分浏览器中无法正常运行

### typescript 插件

#### 安装指令

```
npm i -D @rollup/plugin-typescript
```

该模块依赖于 tslib 和 typescript 模块，所以还需要再安装这两个组件。安装完后还需我们新建 tsconfig 配置，完成后才可在 package.json 的 plugins 配置该插件

#### 作用

可以编译打包 ts 文件

### terser 插件

#### 安装指令

```
npm i -D rollup-plugin-terser
```

#### 作用

压缩代码。rollup 中虽然也有 rollup-plugin-uglify 插件，但只适用于 es5 语法，所以还是需要 terser

## 参考资料

（1）[Rollup 打包工具的使用（超详细，超基础，附代码截图超简单）](https://juejin.cn/post/6844904058394771470)
（2）[说不清 rollup 能输出哪 6 种格式 😥 差点被鄙视](https://juejin.cn/post/7051236803344334862)
（3）[一文带你快速上手 Rollup](https://juejin.cn/post/6869551115420041229)
