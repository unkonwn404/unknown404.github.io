---
title: css文件px转rem操作
date: 2023-08-28 11:04:08
categories:
  - 工作技巧
tags:
  - postcss
  - rem
---

前端尤其是移动端开发时，对屏幕适配换设计稿的要求比较高。常见的方法是将 px 转为 rem，主要有两种实现方式。

### 使用 CSS 预处理器（如 Sass 或 Less）

通过编写变量和函数来实现

```less
$base-font-size: 16px;

@function px2rem($px) {
  @return $px / $base-font-size * 1rem;
}

.example {
  font-size: px2rem(24px); // 1.5rem
  width: px2rem(200px); // 12.5rem
}
```

### 使用 postcss 插件

#### 关于 postcss

PostCSS 是一个用于转换 CSS 的工具，可以通过插件来实现以下功能：

- 自动补全浏览器前缀（autoprefixer）
- 优化 CSS： cssnano 可以进行压缩，purgecss 可以删除未使用的 CSS。

常用的单位转换插件包括 postcss-pxtorem 和 postcss-plugin-px2rem。配置插件后，它会自动将 CSS 文件中的 px 单位转换为 rem。

如果想实现整个项目自动将 px 转为 rem，主要有两个步骤

#### 1.根元素挂载 font-size 样式

rem 单位是相对于根节点的字体大小的，所以需要设置根节点的字体大小。当窗口大小调整时，通过调整根节点的字体大小来实现自适应。

实现代码如下（一般来说设计稿都是 750 的宽度）：

```js
(function (designWidth, maxWidth) {
  var doc = document,
    timer;
  function refreshRem() {
    var width = doc.documentElement.getBoundingClientRect().width;
    // *** 一定程度的适配pc ***
    var rem;
    if (width > maxWidth) {
      rem = 72;
    } else {
      rem = (width * 100) / designWidth;
    }
    // *** 适配pc结束 ***
    doc.documentElement.style.fontSize = rem + "px";
  }
  // rem初始化开始
  refreshRem();
  // 改变窗口大小时重新设置 rem
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(timer); //防止执行两次
      timer = setTimeout(refreshRem, 300);
    },
    false
  );
  // 浏览器后退的时候重新计算
  window.addEventListener(
    "pageshow",
    function (e) {
      // 页面从缓存加载时
      if (e.persisted) {
        clearTimeout(timer);
        timer = setTimeout(refreshRem, 300);
      }
    },
    false
  );
})(750, 540);
```

将这段 js 引入到项目的入口文件 app.html 后，查看页面的 html 节点，是否有被自动添加 font-size。

#### 2.配置 postcss

1. 安装 postcss-pxtorem
2. 在项目根目录下创建一个名为 postcss.config.js 的文件，用于配置 PostCSS 插件。（如果像 nuxt 的项目已经安装了 postcss，可以直接在 nuxt.config.js 文件里配置

```js
module.exports = {
  plugins: {
    "postcss-pxtorem": {
      rootValue: 50,
      propList: ["*"],
    },
    autoprefixer: {},
  },
};
```

### 备注：viewpoint 适配方法

到这里 rem 适配方法已经结束了。现在更为流行的是使用 vw、vh 单位进行适配。但满屏的宽度为 100vw，与设计稿的 750 进行手动换算还是比较麻烦。所以仍需要一些适配操作。原理大体同 rem 类似，主要两种：

1. 使用 CSS 预处理器（如 Sass 或 Less）

```less
@windowWidth: 100vw;
.rpxToVW(@name,@rpx) {
  //传入不带单位的rpx数值，将rpx转为vw
  @{name}: unit(@rpx / 750 * @windowWidth, vw);
}
.taskBlock {
  .rpxToVW(margin,20);
  .rpxToVW(padding,30);
  .rpxToVW(border-radius,10);
}
```

2. postcss

- 安装 postcss-px-to-viewport
- 在根目录新建一个名为 postcss.config.js 的文件

```js
module.exports = {
  plugins: {
    "postcss-px-to-viewport": {
      unitToConvert: "px", // 要转化的单位
      viewportWidth: 375, // UI设计稿的宽度
      unitPrecision: 6, // 转换后的精度，即小数点位数
      propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
      viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
      fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
      selectorBlackList: ["wrap"], // 指定不转换为视窗单位的类名，
      minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
      mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
      replace: true, // 是否转换后直接更换属性值
      exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
    },
  },
};
```

备注： webpack 5 版本 postcss 配置书写方式有差别，从对象形式变为函数形式，如下所示：

```js
module.exports = {
  plugins: [
    require("postcss-px-to-viewport")({
      unitToConvert: "px", // 要转化的单位
      viewportWidth: 375, // UI设计稿的宽度
      unitPrecision: 6, // 转换后的精度，即小数点位数
      propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
      viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
      fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
      minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
      mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
      replace: true, // 是否转换后直接更换属性值
      selectorBlackList: ["wrap"], // 指定不转换为视窗单位的类名
      exclude: [/node_modules/, /src\/views/, /src\/components/, /src\/App/], // 设置忽略文件，用正则做目录名匹配
    }),
    require("autoprefixer")(),
  ],
};
```

## 参考文献

1. [Vue 项目自动转换 px 为 rem，高保真还原设计图](https://juejin.cn/post/6844903557930418189?searchId=202308281046059EA791D01FCE5880F623)
2. [移动端适配解决方案(二)](https://juejin.cn/post/7061866685166256142?searchId=2023082811284766FD14F856BCD7817236)
