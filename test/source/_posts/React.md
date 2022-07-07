---
title: React
date: 2022-06-09 20:47:30
categories:
  - 前端基础
tags:
  - react
---

前端 react 框架方面知识整理。

<!-- more -->
<!-- toc -->

## React 事件机制

### 事件机制特点（以 react 16 为例）

1. 在 jsx 文件中 onClick 或 onCHange 绑定的事件处理函数,根本就没有注册到真实的 dom 上。是绑定在 document 上（react 17 以后是根节点上）统一管理的。
2. 真实的 dom 上的 click 事件被单独处理,已经被 react 底层替换成空函数。
3. react 绑定的事件如 onChange，在 document 上，可能有多个事件与之对应。
4. react 并不是一开始，把所有的事件都绑定在 document 上，而是采取了一种按需绑定，比如发现了 onClick 事件,再去绑定 document click 事件。

### 事件机制流程

#### 注册合成事件

构建初始化 React 合成事件和原生事件的对应关系，合成事件和对应的事件处理插件关系。

#### 事件绑定

1. react dom 对应的 fiber 会在 memoizedProps 和 pendingProps 保存事件
2. diff 阶段如果判断是 react 合成事件，则会按照事件系统逻辑单独处理。
3. 根据 React 合成事件类型，找到对应的原生事件的类型，然后调用判断原生事件类型，大部分事件都按照冒泡逻辑处理，少数事件会按照捕获逻辑处理（比如 scroll 事件）。
4. 调用 addTrappedEventListener 进行真正的事件绑定，绑定在 document 上，dispatchEvent 为统一的事件处理函数。

#### 事件触发

1. 以触发点击事件为例，首先执行的是 dispatchEvent 函数，该函数包括的操作有：
   1）根据真实的事件源对象，找到 e.target 真实的 dom 元素。
   2）根据 dom 元素，找到与它对应的 fiber 对象 targetInst，在我们 demo 中，找到 button 按钮对应的 fiber。
   3）进入 react 的 legacy 模式，在这个模式下，批量更新。
2. 执行事件对应的处理插件中的 extractEvents，模拟事件捕获->事件源->事件冒泡这一过程。具体操作：
   1）形成合成事件源对象
   2）每次 React 会从事件源开始，从上遍历类型为 hostComponent 即 dom 类型的 fiber,判断 props 中是否有当前事件比如 onClick,对于冒泡阶段的事件(onClick)，将 push 到执行队列后面 ， 对于捕获阶段的事件(onClickCapture)，将 unShift 到执行队列的前面。最终形成一个事件执行队列。
   3）将事件执行队列，保存到 React 事件源对象上。等待执行。
3. runEventsInBatch 执行事件队列，如果发现阻止冒泡，那么 break 跳出循环，最后重置事件源，放回到事件池中，完成整个流程。

### React 事件 vs 原生事件

1）事件名称命名方式：原生事件为全小写，react 事件采用小驼峰
2）事件函数处理语法：原生事件为字符串，react 事件为函数
3）默认行为处理：react 事件不能采用 return false 的方式来阻止浏览器的默认行为，而必须要地明确地调用 preventDefault()来阻止默认行为
4）执行时机：两种事件同时存在时会先执行原生事件，再执行 react 合成事件
5）阻止冒泡行为的影响：原生事件（阻止冒泡）会阻止合成事件的执行，react 合成事件（阻止冒泡）不会阻止原生事件的执行

### react 使用合成事件的优点

1. 兼容所有浏览器，更好的跨平台；
2. 将事件统一存放在一个数组，避免频繁的新增与删除（垃圾回收）。
3. 方便 react 统一管理和事务机制。

## React Fiber

React Fiber 并不是真正意义上的纤程（微线程、协程），而是一种基于浏览器的单线程调度算法：在这个过程中，React 渲染的过程可以被中断，可以将控制权交回浏览器，让位给高优先级的任务，浏览器空闲后再恢复渲染。该算法依赖 requestIdleCallback（在一帧时间 16ms (1000ms / 60)内，如果浏览器处理完包括用户输入、js 执行、动画、布局、绘制的任务之后，还有盈余时间，浏览器就会调用 requestIdleCallback 的回调）。

React V15 在渲染时，会递归比对 VirtualDOM 树，找出需要变动的节点，然后同步更新它们。在这个过程期间更新不能中断， 由于 React 占据着浏览器资源，用户触发的事件无法得到响应，导致用户感觉到卡顿。

而 Fiber 是一种将 reconciliation （递归 diff），拆分成无数个小任务的算法；它随时能够停止，恢复。

## React class 组件

### 生命周期

{% image center clear life-cycle-detail.jpeg  %}
react 16.4 以上的生命周期如图所示，列举了常用的生命周期函数，主要分为 3 个阶段

#### 挂载阶段

- **constructor**：进行 state 的初始化，给事件处理方法绑定 this
- **getDerivedStateFromProps**：静态方法，会返回一个对象用于更新 state、或者返回 null 不更新。在接收到新的 props 或者调用了 setState 和 forceUpdate 时该函数会被调用。
- **render**：纯函数，根据 state 和 props 渲染组件。可返回的内容包括原生的 DOM、React 组件、Fragment、Portals、字符串和数字、Boolean 和 null 等
- **componentDidMount**：组件挂载完成后调用，可以进行以下操作：

1. 执行依赖于 DOM 的操作；
2. 发送网络请求；（官方建议）
3. 添加订阅消息；（会在 componentWillUnmount 取消订阅）

#### 更新阶段

当组件的 props 改变了，或组件内部调用了 setState/forceUpdate，会触发更新重新渲染，这个过程可能会发生多次。

- **getDerivedStateFromProps**
- **shouldComponentUpdate**：有两个参数 nextProps 和 nextState，表示新的属性和变化之后的 state，返回一个布尔值，true 表示会触发重新渲染，false 表示不会触发重新渲染，默认返回 true,我们通常利用此生命周期来优化 React 程序性能
- **render**
- **getSnapshotBeforeUpdate**：该函数有两个传入参数 prevProps 和 prevState，表示之前的属性和之前的 state，这个函数有一个返回值，会作为第三个参数传给 componentDidUpdate，通常默认会返回 null。此生命周期函数必须与 componentDidUpdate 搭配使用
- **componentDidUpdate**：该函数有 3 个传入参数 prevProps、prevState 和 snapshot。可以用于当组件更新后，对 DOM 进行操作或者 props 变化时执行网络请求

#### 卸载阶段

- **componentWillUnmount**：主要操作包括

1. 清除 timer，取消网络请求或清除
2. 取消在 componentDidMount() 中创建的订阅等
   这个生命周期在一个组件被卸载和销毁之前被调用，因此你不应该再这个方法中使用 setState。

### 废弃的生命周期

#### componentWillMount

在挂载阶段 render() 之前调用。可以使用 componentDidMount 和 constructor 来代替

#### componentWillReceiveProps

props 更新时调用此方法用于更新 state。会破坏 state 数据的单一数据源，导致组件状态变得不可预测，另一方面也会增加组件的重绘次数。如果在 componentWillReceiveProps 生命周期直接调用父组件的某些有调用 setState 的函数，会导致程序死循环。可以使用 getDerivedStateFromProps 来代替

#### componentWillUpdate

在更新阶段组件渲染 render()之前调用，通常，此方法可以替换为 componentDidUpdate()和 getSnapshotBeforeUpdate()。

对于异步渲染情况，渲染可分为两个阶段：reconciliation 和 commit 。前者过程是可以打断的，后者不能暂停，会一直更新界面直到完成。
|Reconciliation 阶段|Commit 阶段|
| :----: | :----: |
|componentWillMount|componentDidMount|
|componentWillReceiveProps|componentDidUpdate|
|shouldComponentUpdate|componentWillUnmount|
|componentWillUpdate||

因为 Reconciliation 阶段是可以被打断的，所以 Reconciliation 阶段会执行的生命周期函数就可能会出现调用多次的情况，从而引起 Bug。由此对于 Reconciliation 阶段调用的几个函数，除了 shouldComponentUpdate 以外，其他都应该避免去使用。

## 参考文献

（1）[React 事件机制](https://juejin.cn/post/7068649069610024974)
（2）[「react 进阶」一文吃透 react 事件系统原理](https://juejin.cn/post/6955636911214067720)
（3）[react 生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
