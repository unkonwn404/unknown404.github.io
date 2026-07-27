---
title: 页面效果实现整理
date: 2024-08-13 15:50:58
categories:
  - 工作技巧
tags:
  - JavaScript
  - canvas
  - CSS
---

随手记一下一些页面效果实现小技巧

<!-- more -->

## 打字机效果

单行文字的实现：主要是靠函数定时调用自身来实现每个文字的显示都存在时间间隔

```js
const text = "Welcome to the Typing Effect!";
const speed = 100; // 打字速度（毫秒）

let i = 0;
function typeWriter() {
  if (i < text.length) {
    document.getElementById("typewriter").innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

// 开始打字效果
typeWriter();
```

标题轮播打字效果实现：实现点包括打字的定时显示和标题的循环替换，打字的定时显示可以用 for 循环加 await、用定时器控制 Promise 状态完成的时间，等待 Promise 结束后，进入下一次循环，处理下一个字符直到标题字符完成；标题的循环替换也是靠函数定时调用自身来实现，注意在调用自身之前需要考虑标题数组循环到最后一个时的边界条件、以及需要重置展示标题的变量

```js
let currentItemIndex = 0,
  timer = null,
  titles = ["test1", "test2"],
  currentItem = "";
async function showNextItem() {
  if (currentItemIndex >= titleInfo.length) currentItemIndex = 0;

  // 在打印下一项之前重置 currentItem
  currentItem = "";

  // 开始打印下一项
  await typeNextItem();

  currentItemIndex++;
  timer = setTimeout(() => {
    showNextItem();
  }, speed);
}
async function typeNextItem() {
  const currentLine = titles[currentItemIndex];
  // TODO:闪烁问题及报错问题解决
  if (currentLine?.length <= 0) return;
  for (let charIndex = 0; charIndex < currentLine.length; charIndex++) {
    const currentChar = currentLine[charIndex];
    currentItem += currentChar;

    // 使用 Promise 等待打字速度
    await new Promise((resolve) => setTimeout(resolve, typingSpeed));
  }
}
```

## 浏览器刷新或者关闭时弹的提示弹窗

当用户尝试刷新、关闭或离开当前页面时，可以使用 beforeunload 事件来触发一个提示弹窗。这种弹窗通常用于警告用户他们可能会丢失未保存的数据，例如在编辑表单或文档时。

```js
window.addEventListener("beforeunload", function (e) {
  // 检查用户是否有未保存的更改或其他需要提醒的条件
  const shouldWarn = true; // 假设条件成立

  if (shouldWarn) {
    e.preventDefault(); // 标准的阻止行为
    e.returnValue = ""; // 必须设置为非空值才能触发默认对话框
  }
});
```

## 组件扫光效果

CSS 扫光动画的原理很简单，就是一条斜向上 45deg 的线性渐变长方形从左到右的、无限循环的位移动画。需要我们创建一个伪元素，然后通过改变伪元素的位移来实现扫光动画了。

```scss
@keyframes sweep {
  0% {
    visibility: visible;
    left: -100%;
  }
  100% {
    left: 100%;
    visibility: hidden;
  }
}
.sheen-area {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    bottom: 10%;
    left: 0;
    width: 180%;
    height: 70%;
    background: linear-gradient(
      to bottom,
      rgba(229, 172, 142, 0),
      rgba(255, 255, 255, 0.5) 50%,
      rgba(229, 172, 142, 0)
    );
    transform: rotate(60deg);
    animation: sweep 1.4s ease-in infinite;
  }
}
```

在上面这段代码里 sheen-area 是容器，设置 overflow: hidden;隐藏扫光超出容器的部分，伪元素作为扫光条执行从左到右的动画。也可以像[这篇文章](https://segmentfault.com/a/1190000045122864)一样设计动画
