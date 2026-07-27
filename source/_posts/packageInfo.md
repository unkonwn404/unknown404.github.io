---
title: 依赖包管理工具比较
date: 2022-08-23 22:06:42
categories:
  - 技术学习
tags:
  - 前端依赖包管理
  - npm
  - yarn
  - pnpm
---

前端常用的包依赖管理工具有 npm、yarn 以及近期非常受欢迎的 pnpm，本文主要也是对比这几个工具之间的区别。

<!-- more -->


## npm

最早出现的安装包工具， Node.js 标准的软件包管理器。

### 版本控制

npm 是围绕着[语义版本控制（semver）](https://semver.org/)的思想而设计的。大致的准则为：

- 版本号由三部分组成：major.minor.patch，即主版本号.次版本号.修补版本号。
  - 主版本号：更改时代表了一个破坏兼容性的大变化。
  - 次版本号：更改时不会破坏任何内容，增加了新功能。
  - 修补版本号：更改时表示做了向后兼容的缺陷修复。
- 版本是严格递增的，如该例所示：16.2.0 -> 16.3.0 -> 16.3.1
- 修补版本号有时后面可能还会有先行版本号，例如 1.0.0-alpha.1。常用的先行版本一般为 alpha（内部先行版），beta（公开测试版），rc（候选版），stable（稳定版）

#### 版本控制符

使用 npm install 时，会发现 package.json 文件的版本号前面默认出现符号`^`，该符号即为版本控制符。常见的版本控制符包括：

- `~` 会匹配最近的小版本依赖包，比如 ~1.2.3 会匹配所有 1.2.x 版本，但是不包括 1.3.0
- `^ `会匹配最新的大版本依赖包（npm i 默认的版本控制符），比如 ^1.2.3 会匹配所有 1.x.x 的包，包括 1.3.0，但是不包括 2.0.0
- `* `安装最新版本的依赖包，比如 \*1.2.3 会匹配 x.x.x
  除此之外还有其他版本控制方法：

```
{ "dependencies" :
  { "foo" : "1.0.0 - 2.9999.9999",// 大于等于1.0.0 小于 2.9999.9999
  "bar" : ">=1.0.2 <2.1.2", // 比较清晰  左闭右开
  "baz" : ">1.0.2 <=2.3.4", // 左开右闭
  "boo" : "2.0.1", // 规定版本
  "qux" : "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0", // 表达式也算清晰
  "asd" : "http://asdf.com/asdf.tar.gz", // 指定下载地址代替版本
  "til" : "^1.2.3", // 同一主版本号，不小于1.2.3 即 1.x.y  x>=2 y>=3
  "elf" : "~1.2.3",  // 同一主版本和次版本号 即1.2.x x>= 2
  "two" : "2.x" , // 这个比较形象，x>=0  即2.0.0 以上均可
  "thr" : "3.3.x" , // 同上 x>= 0  即3.3.0 以上
  "lat" : "latest",  // 最新版本
  "dyl" : "file:../dyl",  // 从本地下载
  }
}
```

#### package-lock.json

早期的 npm 没有锁定包版本的功能，如果某个依赖包发布了不兼容或者有 bug 版本，部署上线时项目就可能会发生问题。针对这一问题 yarn 提出了固化版本的方案，而 npm 在^5.x.x.x 以后才有的 package-lock.json。
不同版本 npm 对 package-lock.json 的实现是不同的。是在一直迭代和发展的：

1. npm 5.0.x 版本，不管 package.json 怎么变，npm i 时都会根据 lock 文件下载。
2. 5.1.0 版本后 npm install 会无视 lock 文件 去下载最新的 npm 包
3. 5.4.2 版本如果改了 package.json，且 package.json 和 lock 文件不同，那么执行 npm i 时 npm 会根据 package 中的版本号以及语义含义去下载最新的包，并更新至 lock。
   如果两者是同一状态，那么执行 npm i 都会根据 lock 下载，不会理会 package 实际包的版本是否有新。

package-lock.json 的文件格式如下：

```
...
"@ant-design/colors": {
    "version": "4.0.5",
    "resolved": "http://npm.internal.focus.cn:80/@ant-design%2fcolors/-/colors-4.0.5.tgz",
    "integrity": "sha1-19EA11Rcyo9iSVRgSmiS/Ei6Wq4=",
    "requires": {
    "tinycolor2": "^1.4.1"
    }
},
"@ant-design/icons": {
    "version": "4.6.2",
    "resolved": "https://registry.npmjs.org/@ant-design/icons/-/icons-4.6.2.tgz",
    "integrity": "sha512-QsBG2BxBYU/rxr2eb8b2cZ4rPKAPBpzAR+0v6rrZLp/lnyvflLH3tw1vregK+M7aJauGWjIGNdFmUfpAOtw25A==",
    "requires": {
    "@ant-design/colors": "^6.0.0",
    "@ant-design/icons-svg": "^4.0.0",
    "@babel/runtime": "^7.11.2",
    "classnames": "^2.2.6",
    "rc-util": "^5.9.4"
    },
    "dependencies": {
    "@ant-design/colors": {
        "version": "6.0.0",
        "resolved": "https://registry.npmjs.org/@ant-design/colors/-/colors-6.0.0.tgz",
        "integrity": "sha512-qAZRvPzfdWHtfameEGP2Qvuf838NhergR35o+EuVyB5XvSA98xod5r4utvi4TJ3ywmevm290g9nsCG5MryrdWQ==",
        "requires": {
        "@ctrl/tinycolor": "^3.4.0"
        }
    }
    }
},
...
```

可以看到，安装包需要的依赖包，如果顶级依赖满足需求的，则不再安装，仅有 requires 属性；如果不满足，则会在对应文件夹下面根据依赖安装符合版本，如上面的文件里的@ant-design/icons，内部仍有 dependencies 属性。

### 依赖关系

#### npm 2.x

npm2.x 版本安装依赖包时会安装每一个包所依赖的所有依赖项，依赖项的依赖包也会安装在其 node_modules 目录下。如下图所示，即 node_modules 存在嵌套。

```
.
└──node_modules
        ├──test1
        └──test2
            └──node_modules
                    └──test3
```

这样的处理方式造成了两个问题：

1. 多个包之间难免会有公共的依赖，这样嵌套的话，同样的依赖会复制很多次，会占据比较大的磁盘空间。
2. windows 的文件路径最长是 260 多个字符，这样嵌套是会超过 windows 路径的长度限制的。

#### npm 3+

同 yarn 一样采用了扁平化依赖的方式解决问题。与之前的目录相比，现在的文件夹结构更接近于

```
.
└──node_modules
        ├──test1
        ├──test2
        └──test3
```

所有的依赖都被拍平到 node_modules 目录下，不再有很深层次的嵌套关系。这样在安装新的包时，根据 node require 机制，会不停往上级的 node_modules 当中去找，如果找到相同版本的包就不会重新安装，解决了大量包重复安装的问题，而且依赖层级也不会太深。
但扁平化依赖方法存在的问题包括：

- 依赖结构的不确定性。
- 扁平化算法本身的复杂性很高，耗时较长。
- 项目中仍然可以非法访问没有声明过依赖的包
  依赖结构的不确定性是如果声明的依赖包 test1、test2 同时依赖另一个包 test3，但是是不同版本的时候，扁平化的结果可能有两种。

_npm2.x 下 test1、test2 依赖包结构_

```
.
└──node_modules
        ├──test1
        |   └──node_modules
        |           └──test3@1.0.1
        └──test2
            └──node_modules
                    └──test3@1.0.2
```

_npm3+下 test1、test2 安装结果 1_

```
.
└──node_modules
        ├──test1
        └──test2
        |   └──node_modules
        |           └──test3@1.0.2
        └──test3@1.0.1
```

_npm3+下 test1、test2 安装结果 2_

```
.
└──node_modules
        ├──test1
        |   └──node_modules
        |           └──test3@1.0.1
        ├──test2
        └──test3@1.0.2
```

两种结果都有可能存在，实际安装时取决于 test1 和 test2 在 package.json 中的位置，如果 test1 声明在前面，那么就是前面的结构，否则是后面的结构。
为了解决依赖结构的不确定性的问题，npm 5.x 推出 package-lock.json，保证第一次安装以后 node_modules 以后在添加依赖或者重装时也不会变。

## yarn

yarn 是在 npm2.x 版本没有很好的优化方案时提出的，主要用于解决嵌套超过 windows 路径的长度限制的 node_modules。虽然现在 npm 也日益趋同 yarn，但在安装速度上 yarn 还是优于 npm

### 版本控制

默认依赖都会生成 yarn.lock 文件，该文件会通过包名+版本来确定具体信息。
yarn.lock 文件格式如下，yarn 用的是自己设计的格式，语法上有点像 YAML，# 开头的行是注释。依赖的依赖不会被记录在 dependencies，依赖包的依赖版本如果不存在语义冲突则会合并信息

```
"@angular-devkit/core@12.2.10":
  version "12.2.10"
  resolved "http://npm.internal.focus.cn:80/@angular-devkit%2fcore/-/core-12.2.10.tgz#3da62eceef3904f92cd3f860618b4ae513029ce2"
  integrity sha1-PaYuzu85BPks0/hgYYtK5RMCnOI=
  dependencies:
    ajv "8.6.2"
    ajv-formats "2.1.0"
    fast-json-stable-stringify "2.1.0"
    magic-string "0.25.7"
    rxjs "6.6.7"
    source-map "0.7.3"
```

Yarn 仅以 flatten 格式 描述各个包之间的依赖关系，并依赖于其当前实现来创建目录结构。这意味着如果其内部算法发生变化，结构也会发生变化。

### 依赖关系

同 npm 基本一样，其共有的问题是：如果你有 100 个项目使用了某个依赖（dependency），就会有 100 份该依赖的副本保存在硬盘上

## pnpm

同 npm 和 Yarn，都属于 Javascript 包管理安装工具，它较 npm 和 Yarn 在性能上得到很大提升，被称为快速的，节省磁盘空间的包管理工具。

### 依赖关系

为了解决 npm、yarn 安装时依赖可能复制多次、占用磁盘空间的问题，pnpm 采用了全局仓库保存依赖、项目通过 link 的方式访问内容。
![](/img/pnpm.png)

当执行 pnpm install 时，项目的 node_modules 文件夹下除了安装的包名 bar、其依赖保持原有的树状、不进行提升，还会有.pnpm 目录，目录下是以展平结构管理每个版本包的源码内容，以硬链接方式指向 pnpm-store 中的文件地址。pnpm-store 是全局的 store，存储所有 npm 包，同一版本的包仅存储一份内容，甚至不同版本的包也仅存储 diff 内容。
如上图所示一个包的寻找需要经过三层结构：`node_modules/bar` > 软链接 `node_modules/.pnpm/bar@1.0.0/node_modules/bar` > 硬链接 `~/.pnpm-store/v3/files/00/xxxxxx`。

#### 备注：软链接和硬链接

在 Linux 系统中，内核为每一个新创建的文件分配一个 Inode(索引结点)，每个文件都有一个惟一的 inode 号。文件属性保存在索引结点里，在访问文件时，索引结点被复制到内存在，从而实现文件的快速访问。
Linux 中包括两种链接：硬链接(Hard Link)和软链接(Soft Link)，软链接又称为符号链接（Symbolic link）。
硬链接说白了是一个指针，指向文件索引节点，系统并不为它重新分配 inode，他将与源文件共用一个 inode。
软链接相当于 windows 的快捷方式，软链接文件会将 inode 指向源文件的 block，原文件＆链接文件拥有不同的 inode 号

## 参考文献

（1）[关于现代包管理器的深度思考——为什么现在我更推荐 pnpm 而不是 npm/yarn?](https://juejin.cn/post/6932046455733485575)
（2）[yarn or npm 版本固化如何选择](https://juejin.cn/post/6844904022718038024)
（3）[pnpm 是凭什么对 npm 和 yarn 降维打击的](https://juejin.cn/post/7127295203177676837)
（4）[该用 pnpm 了，“快、准、狠”。](https://mp.weixin.qq.com/s/bZ7AVSjBcZrZ3I387_esmg)
