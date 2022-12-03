---
title: 页面置灰的实现方式
date: 2022-12-02 09:46:33
categories:
  - 踩坑经历
tags:
  - css
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

## 参考文献

（1）[MDN position](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position)
（2）[Element implicitly has an 'any' type because index expression is not of type 'number' [7015]](https://stackoverflow.com/questions/53526178/element-implicitly-has-an-any-type-because-index-expression-is-not-of-type-nu)
