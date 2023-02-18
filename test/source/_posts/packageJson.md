---
title: package.json分析
date: 2022-12-15 10:41:29
categories:
  - 技术学习
tags:
  - 前端依赖包管理
---

虽然管理维护前端项目时经常需要跟该文件打交道，但在安装代码规范相关工具时，发现自己对其中的配置并不十分了解，所以想记录一下。

<!-- more -->


## 文件配置

描述配置在这里略过不计，除非自己要写包，不然感觉记忆没什么用

### workspaces

workspaces 主要用于 monorepo 仓库管理模式、解决如何在一个顶层 root package 下管理多个子 packages 的问题，在 workspaces 声明目录下的 package 会软链到最上层 root package 的 node_modules 中，不用手动执行 npm link 操作。

通常子项目都会平铺管理在 packages 目录下，所以根目录下 workspaces 通常配置为：

```
"workspaces": [
  "packages/*"
]
```

## 脚本配置

### scripts

指定项目的一些内置脚本命令，这些命令可以通过 npm run 来执行。npm run 的时候，就会自动创建一个 shell 脚本，将本地目录的 node_modules/.bin 子目录加入 PATH 变量。这意味着，当前目录的 node_modules/.bin 子目录里面的所有脚本，都可以直接用脚本名调用，而不必加上路径。

```
"scripts": {
  "build": "webpack",
  "prebuild": "xxx", // build 执行之前的钩子
  "postbuild": "xxx" // build 执行之后的钩子
}
```

如果存在前缀指令`pre-*`、`post-*`的话，执行指令 npm run build 时会按照`prebuild - build - postbuild`执行顺序执行，这种语法现在并不推崇，需谨慎使用。

### config

用于设置 scripts 里的脚本在运行时的参数。

## 依赖配置

### dependencies

运行依赖，也就是项目生产环境下需要用到的依赖。比如 react，vue，状态管理库以及组件库等。

使用 npm install xxx 或则 npm install xxx --save 时，会被自动插入到该字段中。

### devDependencies

开发依赖，项目开发环境需要用到而运行时不需要的依赖，用于辅助开发，通常包括项目工程化工具比如 webpack，vite，eslint 等。
使用 npm install xxx -D 或者 npm install xxx --save-dev 时，会被自动插入到该字段中。

## 三方配置

package.json 中也存在很多三方属性，比如 tsc 中使用的 types、构建工具中使用的 sideEffects,git 中使用的 husky，eslint 使用的 eslintIgnore。这里只列举部分属性。

### lint-staged

lint-staged 是一个在 Git 暂存文件上运行 linters 的工具，配置后每次修改一个文件即可给所有文件执行一次 lint 检查，通常配合 gitHooks 一起使用。

### browserslist

browserslist 字段用来告知支持哪些浏览器及版本。也可以使用 .browserslistrc 单文件配置。

```
"browserslist": [
  "> 1%",
  "last 2 versions"
]
```

## 参考文献

（1）[深入浅出 package.json](https://juejin.cn/post/7099041402771734559)
（2）[关于前端大管家 package.json，你知道多少？](https://juejin.cn/post/7023539063424548872)
（3）[package.json 配置完全解读](https://juejin.cn/post/7161392772665540644)
