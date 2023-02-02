---
title: 代码样式调整
date: 2022-12-15 22:25:36
categories:
  - 工作技巧
tags:
  - 代码规范
---

为了使代码风格统一，更有利于阅读，可以借助一些工具进行优化。

<!-- more -->
<!-- toc -->

## prettier

代码格式化工具。

### 安装指令

```
npm install --save-dev prettier
or
yarn add prettier -D
```

### 配置方式

在根目录新建 .prettierrc.json，配置自己所需要的参数：

```
{
  "singleQuote": true,  // 使用单引号
  "semi": false,  // 不使用分号
  "bracketSpacing": true,  // 在对象,数组括号与文字之间加空格
  "htmlWhitespaceSensitivity": "ignore",  // 对html的空格不敏感
  "endOfLine": "auto",  // 行结尾统一样式，保持现有的行尾
  "trailingComma": "none", // 对象，数组等末尾不加逗号
  "tabWidth": 2 //  水平缩进的空格数为2
}
```

## lint-staged

本地暂存代码检查工具。只检测 git add . 中暂存区的文件，对过滤出的文件执行脚本。

### 安装指令

```
npm install lint-staged --save-dev
or
yarn add lint-staged -D
```

### 配置方式

lint-staged 从 v3.1 开始可以使用不同的方式进行配置：

- package.json
  示例：

```
"lint-staged": {
    // 匹配暂存区所有的js，vue文件，并执行命令
  "*.{js,vue,jsx,tsx}": [
    "prettier --write",
    "eslint --cache --fix"
  ]
}
```

配置对象的 key 值为匹配的文件，右侧 value 对应执行指令。lint-staged 指令自动在最后包含了 git add 的操作，所以可以不用专门去写

- .lintstagedrc JSON 或 YML 格式的文件
- lint-staged.config.js 格式的文件

## husky

Git hooks 工具，对 git 执行的一些命令，通过对应的 hooks 钩子触发，执行自定义的脚本程序。
常用的 gitHooks 包括：

- pre-commit：每次 commit 之前会执行的操作，常用于触发时进行代码格式验证
- commit-msg：启动提交信息编辑器，常用于对 commit 消息和用户进行校验
- pre-push：远程推代码前执行，常用于推代码前做单元测试和 e2e

### 安装指令

```
npm install husky@4.3 --save-dev
or
yarn add husky@4.3 -D
```

### 配置方式

husky 版本在 6 以下时可以直接在 package.json 配置，例如：

```
"husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
},
```

6 版本以上的 husky 把的配置提取到了根目录，package.json 中的配置在 husky 升级后无效了。需要执行指令：

```
npx husky add .husky/pre-commit "npx lint-staged"
```

指令执行后会在根目录创建 .husky 文件夹，文件夹内部有一个 pre-commit 文件，包含指令 npx lint-staged

## 参考文献

（1）[lint-staged 官方文档](https://www.npmjs.com/package/lint-staged#Configuration)
（2）[prettier 官方文档](https://www.prettier.cn/docs/index.html)
（3）[GitHook 工具 —— husky（格式化代码）](https://juejin.cn/post/6947200436101185566)
