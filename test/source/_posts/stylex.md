---
title: stylex
date: 2024-01-25 14:40:51
categories:
  - 技术分享
tags:
  - CSS
excerpt: 2024技术分享的文档备份
---

## 背景介绍

近日，Meta 开源了一款「CSS-in-JS 库」 —— StyleX。这个项目从提出到 Meta 内部使用到最终开源经历了大约 5 年的时间，据说这套解决方案让 facebook 首页样式文件体积减少了至少 80%。

## 常见 css 方案

### BEM

BEM 是一种用于编写 CSS 类名的命名约定，它基于块（block）、元素（element）和修饰符（modifier）的概念。使用 BEM 命名约定，可以更清晰地表达 CSS 类之间的关系，并使代码更易于维护和扩展。
示例：

```html
<div class="card">
  <div class="card__header">
    <!-- 块内的元素 -->
  </div>
  <div class="card__body">
    <!-- 块内的元素 -->
  </div>
  <div class="card__footer card__footer--highlighted">
    <!-- 块内的元素，并带有修饰符 -->
  </div>
</div>
```

在这个例子中，card 是一个块，它包含了 header、body 和 footer 这些元素。footer 元素还带有一个修饰符 highlighted，表示这个底部元素有一些突出显示的样式。

### CSS Modules

CSS Modules 是一种将 CSS 文件与 JavaScript 模块分离的技术。通过使用 CSS Modules，可以将 CSS 类名限制在模块内部，从而避免全局命名冲突的问题。

示例：
在 webpack 中进行如下配置

```js
// webpack.config.js
module.exports = {
  // 其他配置项
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

将 css 文件引入 js，样式表中的类名将被映射为一个对象，可以通过该对象访问局部化的类名，再在 jsx 或 html 中使用该类名。编译时会自动生成一个唯一的类名，避免全局命名冲突。

```less
.container {
  height: 100vh;
  overflow: scroll;
  background: #f5f7fa;
  .nav {
    background-color: #fff;
  }
}
```

```tsx
import styles from "./styles.less";
import { NavBar } from "antd-mobile";

const MyTask: React.FC = () => {
  // ...
  return (
    <div className={styles.container}>
      <NavBar onBack={() => {}} className={styles.nav}>
        我的任务
      </NavBar>
    </div>
  );
};
```

### 原子 css

原子 CSS 是一种将 CSS 属性分解为最基本的元素的技术。通过使用原子 CSS，可以将复杂的样式表分解为更小的、可重用和可维护的模块。目前这方面的实现有[Tailwind CSS](https://tailwindcss.com/)、[Windi CSS](https://windicss.org/)等
以 Tailwind CSS 为例，它提供了一组预定义的类名，每个类名都代表一个特定的样式属性。通过使用这些类名，可以轻松地创建具有不同样式和布局的组件。
示例：在 css 文件引入预设置的文件

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

使用预设样式
![](/img/stylex/tailwind.jpg)

样式解释：

- max-w-7xl: 这个类设置了元素的宽度最大为 7XL 尺寸，其中 7XL 是 Tailwind CSS 的尺寸单位之一。7XL 通常对应于屏幕尺寸的非常大的屏幕。
- mx-auto: 这个类设置元素的左右边距自动，使元素在水平方向上居中。
- text-center: 这个类将文本内容居中对齐。
- py-12: 这个类设置元素的上边距和下边距为 12 个尺寸单位。在 Tailwind CSS 中，py 是“padding-y”的缩写，表示元素的垂直内边距。
- px-4: 这个类设置元素的左外边距和右外边距为 4 个尺寸单位。px 是“padding-x”的缩写，表示元素的水平内边距。
- sm:px-6: 这个类是一个断点特定的类，它只在屏幕尺寸小于或等于小型设备时生效。在这种情况下，它将元素的水平内边距设置为 6 个尺寸单位。
- lg:py-16: 这个类是一个断点特定的类，它只在屏幕尺寸大于或等于大型设备时生效。在这种情况下，它将元素的上边距和下边距设置为 16 个尺寸单位。
- lg:px-8: 这个类也是一个断点特定的类，它只在屏幕尺寸大于或等于大型设备时生效。在这种情况下，它将元素的左外边距和右外边距设置为 8 个尺寸单位。

### CSS-in-JS

CSS 中的 JavaScript 是一种将 JavaScript 代码嵌入到 CSS 中的方式。通过这种方式，可以在 CSS 中使用 JavaScript 变量、函数和逻辑，以实现更灵活和动态的样式和布局。目前这方面实现的库有[style components](https://styled-components.com/docs/basics)、[Emotion](https://emotion.sh/)等

stylex 也属于 CSS-in-JS 库

## stylex 的基本用法

StyleX 的 API 很少，主要涉及两个常用方法：

- stylex.create，创建样式
  代码示例如下，使用 stylex.create 函数创建了 4 个命名空间：header，logo，link，txtcenter

```jsx
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  header: {
    backgroundColor: "#282c34",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "calc(10px + 2vmin)",
    color: "white",
  },
  logo: {
    height: "40vmin",
    pointerEvents: "none",
  },
  link: {
    color: "#61dafb",
  },
  txtcenter: {
    textAlign: "center",
  },
});
```

- stylex.props，定义 html 的 props，将 stylex.create 定义的样式应用到 html 上（如果定义的是静态样式，dom 上增加的属性为 class；如果定义的是动态样式，dom 上增加的属性为 style）
  代码示例如下：

```jsx
function App() {
  return (
    <div {...stylex.props(styles.txtcenter)}>
      <header {...stylex.props(styles.header)}>
        <img src={logo} {...stylex.props(styles.logo)} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          {...stylex.props(styles.link)}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
```

编译后运行的结果如图所示

![](/img/stylex/stylex.jpg)
可以看到命名空间的样式被拆成了多个类名

## stylex 优势

### 文件可扩展

stylex 减少不必要的 CSS 规则和类名，从而减少最终输出的 CSS 文件大小；即使组件增加，css 大小也不会增加太多

假设样式设置为：

```jsx
import logo from "./logo.svg";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  link: {
    color: "#61dafb",
  },
  txt: {
    color: "#61dafb",
  },
});
function App() {
  return (
    <div>
      <header>
        <img src={logo} alt="logo" />
        <p {...stylex.props(styles.txt)}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          {...stylex.props(styles.link)}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
export default App;
```

![](/img/stylex/scaleable.jpg)

从编译结果可以看到即使命名空间不同，只要样式一致都会赋给相同的类名。这种原子类名的控制粒度确保了即使项目体积增大，样式表的体积也能控制在合理的范围内。

### 样式效果可预测

没有特定的样式优先级问题，最后应用的样式将覆盖先前的样式。这使得样式的应用更加简单和一致。

假设存在如下 css 文件

```css
.blue {
  color: blue;
}
.red {
  color: red;
}
```

以及如下 html

```html
<p class="red blue">我是什么颜色？</p>
```

最终显示的 p 标签是什么颜色的呢？实际上，样式取决于他们在样式表中定义的顺序，.red 的定义在.blue 后面，所以 p 应该是红色的。而如果 blue 和 red 分别在两个 css 文件里，则 p 标签的颜色取决于样式文件的加载顺序。

而在 stylex 中样式的优先级只需要考虑 styles.props 中的调用顺序，以最后一个为准。例如在下面的代码中 blue 在 red 后面，所以颜色为 blue

```jsx
import * as stylex from "stylex";

// 创建样式
const styles = stylex.create({
  red: { color: "red" },
  blue: { color: "blue" },
});

// 使用
<p {...styles.props(styles.red, styles.blue)}></p>;
```

### 样式的类型安全

可以与 typescript 结合、定义类型声明限制自定义组件的样式传参。

```ts
import type {StyleXStyles} from '@stylexjs/stylex';
type Props = {
  // ...
  style?: StyleXStyles<{
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderTopColor?: string;
    borderEndColor?: string;
    borderBottomColor?: string;
    borderStartColor?: string;
  }>;
};
function MyComponent({style, ...}: Props) {
  return (
    <div
      {...stylex.props(localStyles.foo, localStyles.bar, style)}
    >
      {/* ... */}
    </div>
  );
}
```

例如在这段代码中限制了组件 MyComponent 的 style props 只能接受如下 stylex 样式

## stylex 缺点

- 并不提供完整的 css 选择器功能，为了使应用可预测，一些伪类选择器可能并不支持，比如 .className > _、.className ~ _、.className:hover > div:first-child 等

## stylex 适用范围

- 用 js 控制 ui 的框架项目如 react，angular 等，vue、svelte 使用的话需要额外的自定义配置
- 庞大且体积不断增加的项目
- 可复用组件项目

## 后续碎碎念

因为 stylex 提供的 demo 都太简陋了，所以自己尝试用 create-react-app 搭建了一个项目测试它的使用，结果发现居然没有修改打包配置的方法，要想实现还要安装 craco 脚手架，真是麻烦。。。node 版本还必须 16 以上才能运行正常，这个怎么没在文档里写啊。。。话说 create-react-app 这个框架这么封闭、复杂点的需求还要配router和redux、为什么这么多人还喜欢用啊不理解。。。

## 参考文献

（1）[Introduction to StyleX](https://stylexjs.com/docs/learn/)
（2）[你了解 JSX，那你了解 StyleX 么？](https://mp.weixin.qq.com/s/ysFnkHSTSGBn1UIdapZGVg)
