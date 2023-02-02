---
title: hash路由使用锚点解决方案
date: 2022-12-16 10:57:34
categories:
  - 踩坑经历
tags:
  - 前端路由
---

## 问题描述

页面的锚点功能需要 url 的 hash 值与页面的 DOM id 相一致才能进行跳转；而路由在 hash 模式下已经将#占用, 页面的锚点功能失效

## 解决方法

### 场景 1:原生锚点
需要手动获取锚点元素，再使用scrollIntoView方法
```JSX

const CustomLink=(props:{id:string, children:any})=> {
  const {id,children}=props
  const onClick = (e:any) => {
    e.preventDefault();
    const element = document.getElementById(id);
    // scrollIntoView()将目标元素移动到浏览器顶部
    // scrollIntoView(false)将目标元素移动到浏览器底部
    element?.scrollIntoView();
  }
  return <span onClick={onClick}>{children} </span>
}
export default () => {
  return (
    <div >
      <div className='anchor'>
        <CustomLink id='test1'>test1</CustomLink>
        <CustomLink id='test2'>test2</CustomLink>
      </div>
      <div style={{ height: '600vh', padding: 8 }}>Scroll to bottom</div>
      <div id='test1'>test1</div>
      <div>Scroll to bottom</div>
      <div style={{ height: '600vh', padding: 8 }}>Scroll to bottom</div>
      <div>Scroll to bottom</div>
      <div style={{ height: '600vh', padding: 8 }} id='test2'>test2</div>
      <div>Scroll to bottom</div>
    </div>
  );
};
```


### 场景 2:antd 的 anchor 组件

anchor 组件在点击锚点后会修改 URL，而单页应用中如果使用哈希模式的路由，当 URL 被修改后，刷新页面会导致当前路由没有定义而出现 404 的情况。
对于这一情况的解决方案就是利用组件的 onClick 事件阻止默认的 url 修改

```JSX
import React from 'react';
import Anchor from 'antd';
import { useHistory } from 'umi';
const { Link } = Anchor;
export default () => {
  const history = useHistory();
  return (
    <Anchor
      onClick={(event: Event, link: { href: string; title?: string }) => {
        event.preventDefault();
        history.push(`${history.location.pathname}${link.href}`);
      }}
    >
      <Link href="#何时使用" title="何时使用" />
      <Link href="#代码演示" title="代码演示" />
      <Link href="#api" title="API">
        <Link href="#anchor-props" title="Anchor Props" />
        <Link href="#link-props" title="Link Props" />
      </Link>
      <Link href="#faq" title="FAQ" />
    </Anchor>
  );
};

```

经过实际测试发现，调用 event.preventDefault()之后，只会阻止 URL 被修改，并不会阻止点击锚点后的滚动事件。所以不需要像原生场景一样使用 scrollView 函数。但为了url和锚点相对应，增加了history.push函数来实现。

## 参考文献

（1）[antd的anchor组件点击锚点导致路由发生变化](https://blog.csdn.net/weixin_43487782/article/details/108873639)
（2）[项目中使用了Hash路由时如何同时使用锚点？](https://blog.csdn.net/Whoopsina/article/details/123804087)
