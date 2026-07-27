---
title: npm发包流程
date: 2024-11-14 17:51:44
categories:
  - 工作技巧
tags:
  - npm
---

总结一下自己第一次 npm 发包经历，以免忘记了。

<!-- more -->

## 初始化

1. 新建一个文件夹，在文件夹内部使用指令 `npm init -y` 来快速生成一个带有默认值的 package.json。

2. 使用指令安装 ts-loader、typescript、webpack、webpack-cli，其中 ts-loader 是 Webpack 的 TypeScript 加载器，在打包配置中处理以 ts 结尾的文件

## 配置

1. ts 配置：在项目根目录下创建 tsconfig.json 文件，常见配置为以下内容

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationDir": "./dist/types",
    "module": "ESNext",
    "target": "ES5",
    "moduleResolution": "Node",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

2. webpack 配置：在项目根目录创建 webpack.config.js 文件，配置 Webpack

```js
const path = require("path");
const { library } = require("webpack");
module.exports = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"], // 添加必要的文件扩展名
  },
  // entry: 指定入口文件
  entry: "./src/index.ts",
  // 入口文件指定完成之后对文件进行打包，把文件输出到指定的位置  【指定打包文件所在的目录】
  output: {
    // 指定打包文件的目录     __dirname,是一个成员，用来动态获取当前文件模块所属的绝对路径
    //  所以说path:path.resolve(__dirname,"dist")就是在打包之后的文件夹上拼接了一个文件夹，在打包时，直接生成。
    path: path.resolve(__dirname, "dist"),
    // 打包后文件的文件名
    filename: "bundle.js",
    globalObject: "this",
    library: "newsSDK",
    libraryTarget: "umd",
    clean: true,
  },
  // 指定webpack打包时要使用的模块
  module: {
    // 指定要加载的规则
    rules: [
      // 用ts-loader 处理以ts结尾的文件
      {
        // test 指定的是规则生效的文件
        test: /\.ts$/, // 表示去【匹配所有以ts结尾的文件
        // ts要使用的loader
        use: "ts-loader",
        // 要排除的文件
        exclude: /node-modules/,
      },
    ],
  },
};
```

设置说明：

- resolve.extensions：支持解析的扩展名，如果不写 ts 实例中的入口文件路径无法识别
- output.globalObject：设置为 'this' 来确保在不同环境（例如 Node.js 和浏览器）下正确获取全局对象，避免直接使用 window。
- output.library：指定模块作为全局变量的名称。在上面的示例中当直接在浏览器中引入时，该库会以 newsSDK 这个全局变量提供访问。
- output.libraryTarget：设置 library 的暴露方式，常见选项包括：
  'var'：将库作为一个变量（变量名由 output.library 设置）放入全局对象上，在浏览器端使用时需要先加载该模块并引用相关变量。
  'window'：当库加载完成，入口起点的返回值将分配给 window 对象。
  'assign'：将库返回值分配给一个没使用 var 申明的变量中，如果这个变量没有在引入作用域中提前申明过，那么将会挂载在全局作用域中。
  'this'：将库的返回值分配给 this 对象的由 output.library 指定的属性。其中 this 的意义由用户决定。
  'global'：将库的返回值分配给全局对象的由 output.library 指定的属性。
  'commonjs'：以 CommonJS 模块定义方式导出，使这些模块可以在 Node.js 中被引用。
  'commonjs2'：和 commonjs 类似，但是会通过 module.exports 导出所有内容，适用于多个 CommonJS require 对同一个库进行重复调用的情况。
  'amd'：以 AMD 模块定义方式导出，使这些模块可以在 AMD 环境中被引用。
  'umd'：这是一种可以将你的库能够在所有的模块定义下都可运行的方式（并且导出的完全不是模块）。它将在 CommonJS、AMD 环境下运行，或将模块导出到全局下的变量。
  具体在什么环境下使用可参见[这篇文章](https://zhuanlan.zhihu.com/p/108216236)

除了示例中列举出来的配置，还有一些和打包相关的配置，例如：

- externals：指定哪些模块不需要被打包进最终的输出文件中，而是直接在外部环境中引用。这对于依赖于第三方库的项目尤其有用，通常用于避免重复打包体积较大的库，从而减少输出文件的大小。

3. devServer 配置

对打包的结果进行文件引入测试时可以使用 webpack-dev-server，使用方法：
1）指令`npm install webpack-dev-server --save-dev`导入 webpack-dev-server 模块
2）在 webpack.config.js 中进行基本配置：

```
devServer: {
    static: path.join(__dirname, "./examples"),
    compress: true,
    port: 9000,
},
```

3）指令`webpack serve --config webpack.config.js`启动服务

## 模块编写

需要注意的点是如果使用 export default 后，在 UMD 模式下需访问 .default 才是默认导出的内容

## 打包

执行 webpack 打包指令`webpack`默认按 webpack.config.js 文件配置打包，如果存在多个 webpack 配置文件，可以用指令如`webpack --config build/webpack.config.dev.js`指定打包配置。示例中没有指定打包的 mode 可以用指令`webpack --mode development`指定。

## 发包

如果还没有登录 npm 账户，可以使用以下命令登录：npm login。（注意如果是在内网发布的包 npm 源要切到内部的 npm 源）
然后，在项目根目录下运行以下命令发布包：npm publish。
后续更新包时应该注意的点有：1）用户下载的包是用的 package.json 的 main 文件路径，所以更新代码后要重新打包更新 main 路径下的文件；2）包的版本号应该同步更新；3）考虑浏览器直接引入文件的情况，可以写一个 dist 文件上传静态资源到 cdn 方法
综上，可以设置一个复合指令`npm run release:patch`

```json
"scripts": {
    "build:dev": "webpack --mode development",
    "build:prod": "webpack --mode production",
    "server": "webpack serve --config webpack.config.js --mode development",
    "release:patch": "npm run build:prod && npm version patch && npm publish && node publishCDN.mjs"
}
```
