---
title: Nuxt3项目实践踩坑
date: 2024-12-08 12:39:13
categories:
  - 工作技巧
tags:
  - Nuxt
  - ssr
  - Vue
---

最近因产品需求，需要搭建一个支持 ssr 渲染的项目。在搭建 Nuxt3 项目的过程中，出现了很多问题，在此集中记录一下。

<!-- more -->

之所以选 Nuxt3 是考虑团队技术栈和 Vue 2 停止维护的事实决定的，本以为会多少兼容一下 Nuxt 2、Vue 2 的语法，事实证明太天真了。

## 项目初始化

项目需求：
Nodejs >= 18
执行指令

```bash
npx nuxi@latest init <project-name>
```

执行完成后进入`<project-name>`目录下，执行指令 `npm run dev`即可访问 http://localhost:3000

### 目录结构

初始化的 Nuxt 项目目录结构如下：

```
Nuxt3
├── assets                    # 工程化处理的静态资源
├── components                # 项目组件
├── composables               # 响应式共享状态
├── layouts                   # 布局组件
├── middleware                # 路由中间件
├── pages                     # 页面视图
├── plugins                   # 项目公共插件
├── public                    # 不需要工程化处理的静态资源
├── store                     # 状态管理
├── utils                     # 静态工具函数
├── app.vue                   # 入口页面
├── .gitignore                    # git仓库提交忽略配置
├── nuxt.config.ts                # Vite 构建配置入口
├── package.json                  # 项目包管理文件
├── pnpm-lock.yaml                # pnpm包版本管理锁定
└── README.md                     # 项目说明
```

一般情况下我们认为项目开发内容（如页面、组件等）统一放在 src 文件夹内方便管理，因此需要修改 nuxt.config.ts 的配置为

```ts
import { NuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
++  srcDir: 'src/',
} as NuxtConfig);
```

同时将 app.vue、pages 文件等移到 src 目录下，变更为以下目录结构

```
-| /
---| node_modules/
---| nuxt.config.js
---| package.json
---| src/
------| assets/
------| components/
------| layouts/
------| middleware/
------| pages/
------| plugins/
------| public/
------| store/
------| server/
------| app.config.ts
------| app.vue
------| error.vue
```

#### 重要目录介绍

##### pages

页面目录。Nuxt 提供了一个基于文件的路由，使用 Vue Router 在底层创建路由。`pages/index.vue` 文件将映射到应用程序的 `/ `路由。如果要设置动态路由，可用带方括号的文件名或文件夹表示，双方括号表示参数是可选的

##### components

组件目录，放置全部的组件，Nuxt 项目会自动导入注册目录下的组件
如果您在嵌套目录中有一个组件，例如：

```
| components/
--| base/
----| foo/
------| Button.vue
```

那么组件的名称将基于其自身的路径目录和文件名，成为 BaseFooButton。如果希望仅根据组件名称而不是路径自动导入组件，则需要使用扩展形式的配置对象将 pathPrefix 选项设置为 false

##### app.vue

根视图组件，可以在组件中定义全局的样式和行为，并且在应用程序的整个生命周期内始终存在，可以说 app.vue 是 Nuxt.js 3 应用程序的视图层的入口文件。

### 常用工具配置

nuxt 自身提供了很多适配的模块，可优先在[官网](https://www.nuxt.com.cn/modules)上进行查找，阅读安装指南

#### pinia

Nuxt 3 不支持 Vuex，推荐 pinia，在插件市场提供了 pinia 的安装。
安装指令：`npm i pinia @pinia/nuxt`
配置调整：

```js
export default defineNuxtConfig({
  modules: ["@pinia/nuxt"],
});
```

对于选项式文件，如果要引入 pinia 内部的方法和 data 时应使用 setup 函数

```js
setup() {
    const baseStore = useBaseStore();
    return { baseStore };
},
```

#### element ui

Nuxt 3 支持 element plus，和之前的 element ui 略有差异，但基本语法一致
安装指令：`npm i element-plus @element-plus/nuxt -D`
配置调整：

```js
export default defineNuxtConfig({
  modules: ["@element-plus/nuxt"],
});
```

#### postcss-px-to-viewport-8-plugin

如果页面包括 wap 页面，需要引入 postcss-px-to-viewport-8-plugin 插件，实现页面样式与屏幕适配。该插件可以将代码中的 px 自动转换为 vw 单位。
安装指令：`npm i postcss-px-to-viewport-8-plugin --save-dev`
配置调整：

```js
export default defineNuxtConfig({
  postcss: {
    plugins: {
      "postcss-px-to-viewport-8-plugin": {
        unitToConvert: "px", // 要转化的单位
        viewportWidth: 375, // UI设计稿的宽度
        unitPrecision: 6, // 转换后的精度，即小数点位数
        propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
        viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
        fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
        minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
        mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
        replace: true, // 是否转换后直接更换属性值
        exclude: [/node_modules/, /src\/pages\/pc/, /src\/components\/pc/], // 设置忽略文件，用正则做目录名匹配
      },
    },
  },
});
```

插件的配置规则与之前写过的 postcss-px-to-viewport 一致，只是 postcss-px-to-viewport 已废弃了。

### 工程化配置

#### eslint

安装指令：`npx nuxi module add eslint`
指令会自动将模块添加到 nuxt.config.ts 中
配置调整：

```js
export default defineNuxtConfig({
  modules: ["@nuxt/eslint"],
});
```

eslint 规则的修改放到根目录的 eslint.config.mjs 中（基本上就是提交时看哪个校验规则不顺眼，就把插件规则关掉或者从错误降级为 warn）

```js
import withNuxt from "./.nuxt/eslint.config.mjs";
export default withNuxt(
  // Your custom configs here
  {
    rules: {
      "no-empty": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  }
);
```

#### husky

为保证代码格式一致、避免多人提交时因本地代码规则不同出现大量的样式变动修改，影响 review；同时有效防止错误的代码提交到远程，需要用 husky 对提交进行检查。
安装指令：`npm i husky prettier lint-staged --save-dev`
prettier 是规范代码样式的模块，确保团队的代码使用统一相同的格式。lint-staged 是一个基于 Node.js 的库,它可以对 Git 仓库中的暂存区(staged)代码进行线性检测,从而确保代码质量。
接下来的操作包括：

1. 向 package.json 的 scripts 中添加命令：`"lint": "lint-staged",`同时在 package.json 添加 lint-staged 配置：

```json
"lint-staged": {
    "*.{js,vue}": "eslint --fix",
    "*.{css,less,html,json,vue}": "prettier --write"
}
```

这样会对提交的 js、vue 代码做 eslint 检查，对 css,less,html,json,vue 做代码样式检查 2. 运行指令`npx husky install`会在项目根目录下生成一个 .husky/ 文件夹，用于存放 Git 钩子。找到 pre-commit 文件，添加指令：npm run lint。或者在 package.json 中增加配置：

```json
"husky": {
    "hooks": {
        "pre-commit": "lint-staged"
    }
}
```

## 项目开发

### host 别名访问

Nuxt 默认启动时会将开发服务器绑定到 localhost（即 127.0.0.1），这意味着它只允许来自本地主机的访问。如果需要通过其他主机名或 IP 地址访问，必须明确设置绑定的 host。需要修改 nuxt.config.ts 配置如下：

```js
devServer: {
    port: 3000,
    host: "0.0.0.0",
},
```

### 环境区分

nuxt 3 无法和 nuxt 2 一样设置 cross-env、服务端和客户端都可以从 process.env 中获取环境变量。只能在 nuxt.config.ts 设置 runtimeConfig，使用 API useRuntimeConfig 获取设置的环境变量；以前静态获取环境变量、导出请求域名的方式无法实现。
示例：
在运行项目的指令中设置形如：`"dev:prod": "cross-env CODE_ENV=prod nuxt dev"`的指令，确定了运行环境变量 CODE_ENV
项目的 utils 目录下的方法会全局注册，可以在目录下增加一个方法：

```js
const getEnv = () => {
  const config = useRuntimeConfig();
  const CODE_ENV = config.public.CODE_ENV || "prod";
  return CODE_ENV;
};

export default getEnv;
```

在使用组合式 API 写法时可以直接用 getEnv 方法获取运行环境。选项式文件就只能用 setup 生命周期获取了

```js
setup() {
    const env = getEnv();
    return { env };
},
```

### 错误页面

与 app.vue 同级增加一个 error.vue，当项目找不到目标页面、或者页面出现错误就会跳转到该文件的页面

### 路由重定向

如果项目里包含有 pc 和 wap 的页面，可以在项目内部进行重定向（当然对部署域名做 ng 配置也是可以的）
重定向的方法是在中间件文件夹 middleware 下添加一个全局中间件 xxx.global.js

```js
export default defineNuxtRouteMiddleware((from, to) => {
  // skip middleware on client side entirely
  if (import.meta.client) return;
  const userAgent = useRequestHeaders()["user-agent"] || "";
  const isMobile = (ua) => {
    ua = ua.toLowerCase();
    return !!(
      ua.match(/AppleWebKit.*Mobile.*/) || /iphone|ipad|ipod|android/.test(ua)
    );
  };

  if (isMobile(userAgent) && to.path.startsWith("/pc/")) {
    if (from.fullPath === to.fullPath.replace("/pc/", "/wap/")) {
      return; // 避免重定向回来的死循环
    }
    return navigateTo(to.fullPath.replace("/pc/", "/wap/"));
  } else if (!isMobile(userAgent) && to.path.startsWith("/wap/")) {
    if (from.fullPath === to.fullPath.replace("/wap/", "/pc/")) {
      return; // 避免重定向回来的死循环
    }
    return navigateTo(to.fullPath.replace("/wap/", "/pc/"));
  }
});
```

需要注意的点是重定向的条件判断没有针对所有可能性做返回，vue router 检验逻辑会认为有隐患；因此需要对所有可能性做条件处理

## 项目部署

### 镜像打包

因为对 docker 镜像文件编写不熟，所以就不分阶段写了，实现还是可以比较简单的：
1）选择合适版本的 node 源
2）添加文件夹/opt/project、设置文件夹为工作目录
3）选择 npm 源（如果项目使用了私有源）执行指令 npm install 安装依赖
4）执行指令 npm run build:test 打包
5）设置必要的环境变量
6）暴露容器端口 3000（nuxt 默认端口）
7）启动服务器

```dockerFile
FROM node:20-alpine

ADD . /opt/project

WORKDIR /opt/project

RUN npm config set registry  http://verdaccio.privacy.com/ && npm install
# 不缓存安装包
RUN apk add --no-cache curl

RUN npm run build:test

ENV NODE_ENV production
# 暴露容器端口
EXPOSE 3000

ENTRYPOINT ["node","./.output/server/index.mjs"]
```

因为打包完后 nuxt 的入口文件为.output/server/index.mjs，直接用 node 指令运行就能看到结果。
之后使用容器服务、拉取打包好的镜像即可。

一般部署到这里就结束了，然而如果项目通过 ng 配置、放在一个和其他项目共用的域名下可能会有问题，因为打包后.output/public 文件夹下存有静态文件，项目访问这些文件时会通过域名+文件夹的路径访问，可能会出现因域名 ng 配置规则无法命中导致静态资源请求 404。如果要解决这个问题，需要将 public 文件夹下的内容上传至 cdn，同时将 nuxt.config.ts 添加配置：

```
app: {
    cdnURL: getPublicPath(),
}
```

镜像打包文件增加一行上传 cdn 指令：

```dockerFile
FROM node:20-alpine

ADD . /opt/project

WORKDIR /opt/project

RUN npm config set registry  http://verdaccio.privacy.com/ && npm install
# 不缓存安装包
RUN apk add --no-cache curl

RUN npm run build:test

RUN npm run upload:test

ENV NODE_ENV production
# 暴露容器端口
EXPOSE 3000

ENTRYPOINT ["node","./.output/server/index.mjs"]
```

### 日志服务

为了偷懒不研究 pm2 的用法，使用了 nuxt3-winston-log，是官方推荐的插件。配置可参考 [npm 说明](https://www.npmjs.com/package/nuxt3-winston-log)
nuxt3-winston-log 会收集代码中所有的 console 打印语句，日志内容可通过登录容器服务器，在项目根目录的 logs 文件夹下查看 info 和 error 的打印情况

## 参考文献

1. [Nuxt3 项目工程化、环境变量、SEO 配置](https://juejin.cn/post/7379521155285843980)
2. [超完整的 Nuxt3 踩坑实录，那真是泰裤辣！](https://juejin.cn/post/7236635191379509308?searchId=202412031133081B66D928AF3CC959C84B)
3. [nuxt3 项目打包部署上线](https://juejin.cn/post/7224435010072346683?searchId=20241215213456642157F15B260AB6947E) 
4. [使用 Docker 部署 Nuxt 3 的专家技术](https://juejin.cn/post/7197214505347137592)
