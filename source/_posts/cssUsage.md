---
title: 页面置灰的实现方式
date: 2022-12-02 09:46:33
categories:
  - 踩坑经历
tags:
  - CSS
---

记一次 css 踩坑经历

<!-- more -->

## 业务需求描述

涉及一些重要的悼念活动时，需要将网站主页面置为灰色，同时希望不要影响其他功能页面的颜色

## 实现方式

可将页面的 CSS 样式设置为：

```
.[classname]  {
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
    filter: gray;
}
```

需要注意的点是如果页面组件有 fixed 定位，上述 css 写法可能会导致组件位置出现问题，根据 MDN 的文档，对 position 定位有下面一段描述：

> **fixed**
> 元素会被移出正常文档流，并不为元素预留空间，而是通过指定元素相对于屏幕视口（viewport）的位置来指定元素位置。元素的位置在屏幕滚动时不会改变。打印时，元素会出现在的每页的固定位置。fixed 属性会创建新的层叠上下文。当元素祖先的 transform, perspective 或 filter 属性非 none 时，容器由视口改为该祖先。

**解决方法：**
将 filter 的样式写在 html 上。
**注意点：**

1. 非 SPA 项目处理时书写方式最好是：

```
html  {
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
    filter: gray;
}
```

这是因为尽管 html5.0 规范允许在`<html>`标签上添加 class 属性，但没有保证该 class 属性一定能生效。

2. 处理 SPA 页面时如果书写上述样式，会导致所有页面样式都会变灰。比较好的实现方式是利用页面的生命周期，为 html 节点手动添加样式。并在页面跳转时去除变灰样式。这里以 react 为例：

```
componentDidMount() {
    if(global.document){
      const html=document.getElementsByTagName('html')
      if(html[0]){
        html[0].style['filter' as any]='grayscale(100%)'
      }
    }
}
componentWillUnmount(){
    if(global.document){
        const html=document.getElementsByTagName('html')
        if(html[0]){
            html[0].style['filter'  as any]='none'
        }
    }
}
```

3. 使用 js 添加样式时，如果代码使用了 ts 语法，可能会报错：`Element implicitly has an 'any' type because index expression is not of type 'number'`，这是因为 CSSStyleDeclaration 它的 index 值设置为了 number 而不是 string，这个报错的根本原因，兼容浏览器的 css 属性`-webkit-*`、`-o-*`等已经不在 CSSStyleDeclaration 内部了。考虑到现在大部分浏览器都支持 css3 了，兼容性写法可以适时去掉

## 扩展：固定定位组件兼容祖先元素的样式

根据[这篇文章](https://juejin.cn/post/7265121637497733155)的说法，可以考虑找到相对定位的祖先元素，相对该祖先元素计算定位。其寻找定位参考的祖先元素的思路与 [popper-js]() 类似，popper-js 具备自动跟踪的定位的功能，比如滚动条滚动的时候，会自动帮你更改定位坐标

1. 寻找定位参考的祖先元素
   定位参考的祖先元素、即包含块也可能是由满足以下条件的最近父级元素的内边距区的边缘组成的：

- transform  或  perspective  的值不是  none
- will-change  的值是  transform  或  perspective
- filter  的值不是  none  或  will-change  的值是  filter（只在 Firefox 下生效）。
- contain  的值是  paint（例如：contain: paint;）
- backdrop-filter  的值不是  none（例如：backdrop-filter: blur(10px);）

> 包含块：元素用来计算和定位一个的框。
>
> - 根元素(很多场景下可以看成`<html>`)被称为‘初始包含块’,其尺寸等同于浏览器可视窗口的大小。
> - 对于其他元素，如果该元素的 position 是 relative 或者 static，则包含块由其最近的块级祖先元素 content box 边界形成。
> - 如果元素的 position:fixed，则‘包含块’是初始包含块。
> - 如果元素的 position:absolute，则其包含块由最近的 position 值不为 static 的祖先元素建立。

```js
export function getContainingBlock(element: Element) {
  let currentNode = element.parentElement;
  while (currentNode) {
    if (isContainingBlock(currentNode)) return currentNode;
    currentNode = currentNode.parentElement;
  }
  return null;
}
import { isSafari } from "./isSafari";
export function getWindow(node: any): typeof window {
  return node?.ownerDocument?.defaultView || window;
}
export function getComputedStyle(element: Element): CSSStyleDeclaration {
  return getWindow(element).getComputedStyle(element);
}
// 判断包含块
export function isContainingBlock(element: Element): boolean {
  const safari = isSafari();
  const css = getComputedStyle(element);

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  return (
    css.transform !== "none" ||
    css.perspective !== "none" ||
    (css.containerType ? css.containerType !== "normal" : false) ||
    (!safari && (css.backdropFilter ? css.backdropFilter !== "none" : false)) ||
    (!safari && (css.filter ? css.filter !== "none" : false)) ||
    ["transform", "perspective", "filter"].some((value) =>
      (css.willChange || "").includes(value)
    ) ||
    ["paint", "layout", "strict", "content"].some((value) =>
      (css.contain || "").includes(value)
    )
  );
}
```

- getComputedStyle：获取节点的样式信息，window.getComputedStyle(element,pseudoClass)返回的是一个 CSS 样式声明对象([object CSSStyleDeclaration])，注意是只读。
- getWindow：火狐浏览器不是很支持window.getComputedStyle，所以需要dom.ownerDocument.defaultView获取节点的根节点的关联的窗口对象（一般浏览器也就返回window了）。

2. 计算定位
   这里计算的定位不是组件组件相对于视口的，而是相对于包含块的。
   ![](/img/containPos.jpg)
   从这个示意图可以看出，相对于包含块的定位计算方式为：

x = 按钮到视口左边的距离 - 定位上下文到视口左边的距离 + 定位上下文的横向滚动距离
y = 按钮到视口顶部的距离 - 定位上下文到视口顶部的距离 + 定位上下文的纵向滚动距离

```js
affixDom.style.top = `${isHTMLElement(offsetParent) ? (fixedTop as number) - offsetParent.getBoundingClientRect().top : fixedTop}px`;
```

## 参考文献

（1）[MDN position](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position)
（2）[Element implicitly has an 'any' type because index expression is not of type 'number' [7015]](https://stackoverflow.com/questions/53526178/element-implicitly-has-an-any-type-because-index-expression-is-not-of-type-nu)
（3）[js原生获取元素的css属性](https://www.cnblogs.com/leaf930814/p/6985017.html)
（4）[【目前最好的react组件库教程】手写增强版 @popper-js （主体逻辑分析）](https://juejin.cn/post/7257785104713367611)
