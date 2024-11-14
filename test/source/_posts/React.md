---
title: React
date: 2022-06-09 20:47:30
categories:
  - 前端基础
tags:
  - React
---

前端 react 框架方面知识整理。

<!-- more -->

## React 相关基本概念

### JSX

#### JSX 定义

一个类似于 XML 的 JavaScript 的语法扩展。用 js 语法表示 UI 的类模版语言，用于创建虚拟 DOM。

JSX 的本质是 React.createElement(component, props, ...children)方法的语法糖。通过 babel 可以将 jsx 文件转为 React.createElement

#### JSX 语法特点

- 只能有一个根元素
- 存在多行 dom 内容时，可以将内容包裹在括号中
- 标签首字母：
  如果是小写字母开头，React 则将改标签转为 html 中同名元素，若 html 没有同名标签，则报错
  如果是大写字母开头，React 就去渲染对应的组件，若组件没有定义，则报错
- 样式的类名指定不用 class，要用 className；style 内部样式属性也同样用 camelCase（小驼峰命名）来定义。这是因为 jsx 本质不是 html
- {}中不能写 JS 语句

### 受控组件和非受控组件

受控组件：表单组件如`<input><select><textearea>`等元素受外部数据源 state 控制，更新只能通过 onChange 事件内部设置 setState()来更新。
非受控组件：表单组件是通过使用 ref 来从 DOM 节点中获取表单数据、defaultValue 设置初始值。

根据 React 官方文档，绝大部分时候推荐使用受控组件来实现表单，因为在受控组件中，表单数据由 React 组件负责处理；如果选择受受控组件的话，表单数据就由 DOM 本身处理。

实际工作中，仅用于单次表单提交、提交时校验的情况使用非受控组件即可，其特点是更方便快捷，代码量小，但是控制能力比较弱。涉及对数据进行即时校验，格式化输入数据等需求，受控组件更适合使用，其控制能力强，但是代码量会比较多。在开发中应该权衡需求，进度进行相应的选择。

### 单向数据流的优缺点

优点：
数据流从上到下非常清晰，状态变化容易预测，易于调试。可避免副作用，例如数据可以在多个组件之间随意修改，可能导致的状态的不一致性。
缺点：
如果数据需要跨层级传递，可能会出现大量属性传递，代码繁琐，也会导致不必要的渲染。
如果数据传递不存在父子关系，组件的通信会变得复杂。

### react 组件重新渲染的方式

1. state 改变
2. props 改变
3. forceUpdate
4. 父组件重新渲染（即使传入子组件的 props 未发生变化，那么子组件也会重新渲染）

### 虚拟 DOM

#### 虚拟 DOM 实现原理

从本质上来说，Virtual Dom 是一个 JavaScript 对象，通过对象的方式来表示 DOM 结构。将页面的状态抽象为 JS 对象的形式，配合不同的渲染工具，使跨平台渲染成为可能。通过事务处理机制，将多次 DOM 修改的结果一次性的更新到页面上，从而有效的减少页面渲染的次数，减少修改 DOM 的重绘重排次数，提高渲染性能。

#### 虚拟 DOM 优缺点

优点：

1. 保证性能下限
   在回流、重绘的情况下，真实 DOM 操作需要重建所有的 DOM，而虚拟 DOM 操作可以用 diff 算法统一更新必要的 DOM
   Virtual DOM 的更新 DOM 的准备工作耗费更多的时间，也就是 JS 层面，相比于更多的 DOM 操作它的消费是极其便宜的。
2. 可以跨平台
3. 无需手动操作 DOM

缺点：

4. 无法极致优化

#### React diff 算法原理

- 真实的 DOM 首先会映射为虚拟 DOM；
- 当虚拟 DOM 发生变化后，就会根据差距计算生成 patch，这个 patch 是一个结构化的数据，内容包含了增加、更新、移除等；
- 根据 patch 去更新真实的 DOM，反馈到用户的界面上。

在 React16 之前，React 是直接递归比较 vdom 的，setState 会触发重新渲染，对比渲染出的新旧 vdom，对差异部分进行 dom 操作。
在 React16 之后，为了优化性能，会先把 vdom 转换成 fiber，也就是从树转换成链表，然后再渲染。整体渲染流程分成了两个阶段：

reconciliation 阶段：从 vdom 转换成 fiber，并且对需要 dom 操作的节点打上 effectTag 的标记
commit 阶段：对有 effectTag 标记的 fiber 节点进行 dom 操作，并执行所有的 effect 副作用函数。这个阶段是同步的，不可中断，以保证最终的更新操作能应用到实际的 DOM 中。

从 vdom 转成 fiber 的过程叫做 reconcile（调和），这个过程是可以打断的，由 scheduler 调度执行。

React 的 diff 算法是分成两次遍历的：
**第一轮遍历**，一一对比 vdom 和老的 fiber，如果 key 和 type 相同则认为该节点可以复用、处理下一个节点，否则就结束遍历。
如果所有的新的 vdom 处理完了，那就把剩下的老 fiber 节点删掉就行。
如果还有 vdom 没处理，那就进行第二次遍历；
**第二轮遍历**，主要是解决节点移动的问题：遍历新的 vdom 节点，每一个都去看看这个节点在旧 fiber 链中的位置（旧位置），如果旧位置在最新固定节点的右边，说明这个节点位置不变，就是可复用，移动过来打上更新的标记，并成为新的固定节点；如果旧位置在最新固定节点的左边，当前这个节点的位置要往右挪。最后把剩下的老 fiber 删掉，剩下的新 vdom 新增。

#### React 列表渲染为什么要用 key？

diff 算法中通过 tag 和 key 来判断是否是同一个节点，因此必须用 key。且
[key 值最好不是 index](https://juejin.cn/post/7099745927413366797)，因为列表依赖的数据长度可能会变化，而使用 index 作为 key 不能表征数据的变化，影响性能；在列表结构内部使用其他元素如 input 时 diff 算法会认为其没有发生变化，因此内部的数据也不会更新
key 值也不能是 random、不然会增加 diff 计算量

## React 事件机制

### 事件机制特点（以 react 16 为例）

1. 在 jsx 文件中 onClick 或 onChange 绑定的事件处理函数,根本就没有注册到真实的 dom 上。是绑定在 document 上（react 17 以后是根节点上）统一管理的。
2. 真实的 dom 上的 click 事件被单独处理,已经被 react 底层替换成空函数。
3. react 绑定的事件如 onChange，在 document 上，可能有多个事件与之对应。
4. react 并不是一开始，把所有的事件都绑定在 document 上，而是采取了一种按需绑定，比如发现了 onClick 事件,再去绑定 document click 事件。

总结：采用了合成事件，即将浏览器的原生事件统一封装，暴露给组件以保持一致的事件接口；以事件委托的方式处理事件，即在根节点（如 document 或根 DOM 节点）上监听所有事件

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

### 为什么 react 需要 fiber ，vue 不需要？

- react 更新组件，自顶向下，该组件以及它的子组件全部需要渲染。 vue 更新组件，通过 get、set 准确定位到视图
- react 因为先天的不足——无法精确更新，所以需要 react fiber 把组件渲染工作切片；而 vue 基于数据劫持，更新粒度很小，没有这个压力；
- react fiber 这种数据结构使得节点可以回溯到其父节点，只要保留下中断的节点索引，就可以恢复之前的工作进度

## React class 组件

### 生命周期

![](/img/life-cycle-detail.jpeg)
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

### 适合做异步请求的生命周期

componentDidmount

### setState

#### setState 用法

```JavaScript
setState(object nextState[, function callback])
```

传入的参数包括：

- nextState，对象属性。将要设置的新状态，该状态会和当前的 state 合并
- callback，回调函数。可选参数。该函数会在 setState 设置成功，且组件重新渲染后调用。等价于在 componentDidUpdate 生命周期内执行。在这个回调函数中你可以拿到更新后 state 的值。

#### setState 调用流程

setState 方法会将将新的 state 放进组件的状态队列里，等待合适的时机，批量更新 state，重新构建 React 元素树并且着手重新渲染整个 UI 界面。

#### setState 同步还是异步

setState 并不是单纯同步/异步的，它的表现会因调用场景的不同而不同。在源码中，通过 isBatchingUpdates 来判断 setState 是先存进 state 队列还是直接更新，如果值为 true 则执行异步操作，为 false 则直接更新。

“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值。

异步： 在 React 可以控制的地方，就为 true，比如在 React 生命周期事件和合成事件中，都会走合并操作，延迟更新的策略。
同步： 在 React 无法控制的地方，比如原生事件，具体就是在 addEventListener 、setTimeout、setInterval 等事件中，就只能同步更新。

## React 函数组件

### hook 原理

```JavaScript
// react-reconciler/src/ReactFiberHooks.js
export type Hook = {
  memoizedState: any, // 最新的状态值
  baseState: any, // 初始状态值，如`useState(0)`，则初始值为0
  baseUpdate: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null, // 临时保存对状态值的操作，更准确来说是一个链表数据结构中的一个指针
  next: Hook | null,  // 指向下一个链表节点
};
```

hooks 的实现就是基于 fiber 的，会在 fiber 节点上放一个链表，节点的结构如上面的 Hook 所示。React Hooks 是用链表来保存状态的，memoizedState 属性保存的实际上是这个链表的头指针。
每个 useXxx 的 hooks 都有 mountXxx 和 updateXxx 两个阶段，mount 阶段在节点的 memorizedState 属性上存放了对应的数据，然后 update 阶段使用不同的 hooks api 使用对应的数据来完成更新的功能。较为简单的钩子函数如 useRef、useCallback、useMemo，它们只是对值做了缓存；而复杂的钩子如 useState、useEffect 则会涉及 fiber 的空闲调度

### class 与 hook 区别

**类组件**的根基是 OOP（面向对象编程），所以它有继承、有属性、有内部状态的管理。
**函数组件**的根基是 FP，也就是函数式编程。它属于“结构化编程”的一种，与数学函数思想类似。也就是假定输入与输出存在某种特定的映射关系，那么输入一定的情况下，输出必然是确定的。

- 类组件是可以实现继承的，而函数组件缺少继承的能力。继承比较黑盒，不建议采用。组合优于继承
- 类组件 this 模糊性
- 函数式组件写法简单，无生命周期函数，类组件划分了明确的生命周期
- 类组件在涉及状态管理时代码会显得很复杂，函数式相比之下简单点

### useState 要使用数组而不是对象

数组解构可以重命名

- 如果 useState 返回的是数组，那么使用者可以对数组中的元素命名，代码看起来也比较干净
- 如果 useState 返回的是对象，在解构对象的时候必须要和 useState 内部实现返回的对象同名，想要使用多次的话，必须得设置别名才能使用返回值

## 组件间通信

### 父子组件通信

父组件->子组件：通过 props 传递数据给子组件
子组件->父组件：子组件通过调用父组件传来的函数传递数据给父组件

### 兄弟组件通信

可以通过共同的父组件来管理状态和事件函数。比如说其中一个兄弟组件调用父组件传递过来的事件函数修改父组件中的状态，然后父组件将状态传递给另一个兄弟组件。

### 跨多层次组件通信

可以使用 Context API

- React.createContext 会创建一个 Context 对象，每个 Context 对象都会返回一个 Provider React 组件，它允许消费组件订阅 context 的变化。Provider 接收一个 value 属性，传递给消费组件。
- Context 对象的 Consumer 组件可以接收当前的 context 值，并返回一个 React 节点。传递给函数的 value 值等价于组件树上方离这个 context 最近的 Provider 提供的 value 值。如果没有对应的 Provider，value 参数等同于传递给 createContext() 的 defaultValue。
- 挂载在 class 上的 contextType 属性可以赋值为由 React.createContext() 创建的 Context 对象。此属性可以让你使用 this.context 来获取最近 Context 上的值。

### 任意组件

可以通过 Redux 或者 Event Bus 解决，另外如果你不怕麻烦的话，可以使用这种方式解决上述所有的通信情况

## React 生态

### Redux

#### 相关概念

- state：数据源存放位置
- action：定义分发行为
- dispatch：分发 action 的函数
- reducer：处理 action 的函数，返回新的 state

#### 工作流程

- 首先，用户（通过 View）发出 Action，发出方式就用到了 dispatch 方法
- 然后，Store 自动调用 Reducer，并且传入两个参数：当前 State 和收到的 Action，Reducer 会返回新的 State
- State—旦有变化，Store 就会调用监听函数，通过 mapStateToProps 将新 state 传给组件来更新 View

Redux 实现示例：

```JSX
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
class App extends React.Component{
    render(){
        let { text, click, clickR } = this.props;
        return(
            <div>
                <div>数据:已有人{text}</div>
                <div onClick={click}>加人</div>
                <div onClick={clickR}>减人</div>
            </div>
        )
    }
}
const initialState = {
    text:5
}
const reducer = function(state,action){
    switch(action.type){
        case 'ADD':
            return {text:state.text+1}
        case 'REMOVE':
            return {text:state.text-1}
        default:
            return initialState;
    }
}

let ADD = {
    type:'ADD'
}
let Remove = {
    type:'REMOVE'
}

const store = createStore(reducer);

let mapStateToProps = function (state){
    return{
        text:state.text
    }
}

let mapDispatchToProps = function(dispatch){
    return{
        click:()=>dispatch(ADD),
        clickR:()=>dispatch(Remove)
    }
}

const App = connect(mapStateToProps,mapDispatchToProps)(App);

ReactDOM.render(
    <Provider store = {store}>
        <App></App>
    </Provider>,document.getElementById('root')
)
```

#### Redux 中异步的请求怎么处理

使用 react-thunk 中间件

1. store 配置中间件

```JSX
import thunk from 'redux-thunk';
import reducer from './reducer';
import { createStore, applyMiddleware, combineReducers } from 'redux';

export const getClientStore = () => {
    const defaultState = window.__context__.state;
    return createStore(reducer, defaultState, applyMiddleware(thunk.withExtraArgument(clientRequest)));
}
```

2. 添加一个返回 action 的函数，内部调用异步接口

```JavaScript
/**
  发送get请求，并生成相应action，更新store的函数
  @param url {string} 请求地址
  @param func {function} 真正需要生成的action对应的actionCreator
  @return {function}
*/
// dispatch为自动接收的store.dispatch函数
export const getHttpAction = (url, func) => (dispatch) => {
    axios.get(url).then(function(res){
        const action = func(res.data)
        dispatch(action)
    })
}
```

3. 分发 action

```JSX
componentDidMount(){
    var action = getHttpAction('/getData', getInitTodoItemAction)
    // 发送函数类型的action时，该action的函数体会自动执行
    store.dispatch(action)
}
```

react-saga 也是处理异步的中间件，允许你在独立的 saga 文件中集中处理异步逻辑，相比 react-thunk 更适合复杂异步逻辑和流程控制的大型项目。

### DVA

基于 redux 和 redux-saga 的数据流方案，dva 额外内置了 react-router 和 fetch 简化开发

#### 相关概念

- State 数据，通常为一个 JavaScript 对象，操作的时候每次都要当作不可变数据（immutable data）来对待，保证每次都是全新对象，没有引用关系，这样才能保证 State 的独立性，便于测试和追踪变化。
- Action 行为，一个普通 JavaScript 对象，它是改变 State 的唯一途径。
- dispatch，一个用于触发 action 改变 State 的函数。
- Reducer 描述如何改变数据的纯函数，接受两个参数：已有结果和 action 传入的数据，通过运算得到新的 state。
- Effects（Side Effects） 副作用，常见的表现为异步操作。dva 为了控制副作用的操作，底层引入了 redux-sagas 做异步流程控制，由于采用了 generator 的相关概念，所以将异步转成同步写法，从而将 effects 转为纯函数。
- Connect 一个函数，绑定 State 到 View

#### 实践示例

```JSX

// 创建应用
const app = dva();
app.use(createLoading()) // 使用插件
// 注册 Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    add(state) { return state + 1 },
  },
  effects: {
    *addAfter1Second(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'add' });
    },
  },
});
// 注册视图
app.router(() => <ConnectedApp />);
// 启动应用
app.start('#root');
```

### React SSR

代表框架：Next.js
特点：服务器端渲染 HTML 字符串并注入数据状态，在首次加载时生成完整页面的 DOM 结构，并在客户端接手后增强交互性。这样不仅能提高 SEO 性能，还改善了页面的首屏渲染体验。

### React 项目优化

- 使用 useMemo 缓存变量
- 使用 useCallback 缓存函数
- 循环添加 key, key 最好用数组项的唯一值，不推荐用 index

## 参考文献

（1）[React 事件机制](https://juejin.cn/post/7068649069610024974)
（2）[「react 进阶」一文吃透 react 事件系统原理](https://juejin.cn/post/6955636911214067720)
（3）[react 生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
（4）[「2021」高频前端面试题汇总之 React 篇（下）](https://juejin.cn/post/6940942549305524238)
（5）[图解 React 的 diff 算法：核心就两个字 —— 复用](https://juejin.cn/post/7131741751152214030)
（6）[深入理解 React Diff 算法](https://juejin.cn/post/6919302952486174733)
（7）[React](https://alexjjwu.fun/web/docs/alexwjj/fe-study/)
（8）[一文彻底搞懂 DvaJS 原理](https://juejin.cn/post/6963466553601835044)
（9）[React Hooks 的原理，有的简单有的不简单](https://juejin.cn/post/7075701341997236261)
