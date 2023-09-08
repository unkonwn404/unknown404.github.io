---
title: React Hooks学习笔记
tags:
  - React
categories:
  - 前端技术体系
date: 2022-04-08 14:47:53
---

记录常用的 React 钩子的使用方法。

<!-- more -->

## React Hook 规则

（1）只在最顶层使用 Hook：不要在循环，条件或嵌套函数中调用 Hook
（2）只在 React 函数中调用 Hook：可以在 React 组件或自定义钩子中调用

## useState

使用示例：

```
[selfState,setSelfState]=useState(initialState)
```

输入参数：初始状态 initialState。如果 initialState 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。
返回参数：当前状态名 selfState 和更新状态函数名 setSelfState
setSelfState 可以传入新值来变更状态 setSelfState(newState)；如果需要根据先前的状态更新状态，也可以使用回调函数 setSelfState(prevState => newState)
注意点：
（1）因为 state 只在组件首次渲染的时候被创建。在下一次重新渲染时，useState 返回给我们当前的 state。
（2）initialState 可以是数组或对象，不像 class 中的 this.setState，更新 state 变量总是替换它而不是合并它。
（3）过时状态问题：class 和 hooks 的写法里，异步操作的过程中如何改变 state 的值，最后打印的时候都是最初的值或者说异步操作开始定义的时候的 state 的值。如下面的函数组件中 setTimeout 取到的都是旧值，是因为 react 中一直遵循一个原则，即 state 指向的内容是不可变的，所以每一次 state 的更新都是指向变了。因为闭包的原因，setTimeout 中依然指向的原来的对象，所以旧的 state 没有释放，所以会取到旧值。

```
function DelayedCount() {
  const [count, setCount] = useState(0);

  const handleClickAsync = () => {
    setTimeout(function delay() {
      setCount(count + 1);
    }, 3000);
  }

  return (
    <div>
      {count}
      <button onClick={handleClickAsync}>Increase async</button>
    </div>
  );
}
```

以上代码点击多次时不能正确记录点击次数。解决方法是使用 setCount(count => count + 1)，这样不依赖外部变量、确保将最新状态值作为参数提供给更新状态函数，过时闭包的问题解决了。

### 备注：React 闭包

react hook 的存储结构为链表结构，react 组件的 hooks 会按照顺序存储在下面的链表结构中。

```ts
export type Hook = {
  memoizedState: any;
  baseState: any;
  baseQueue: Update<any, any> | null;
  queue: any;
  next: Hook | null;
};
```

在下面这段代码中，尽管渲染出的 count 值在变化，但是控制台打印出来的却没有。组件的工作流程大致是：useEffect 函数在第一次渲染完成后触发内部函数，创建计时器、react 组件状态改变发生重渲染、计时器持续工作改变 count 的内容、渲染内容不断更新。

```js
import React, { useState, useEffect } from "react";

export default () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1);
      console.log(count, "count");
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <p>count: {count}</p>
    </>
  );
};
```

然而在更新过程中，对于 useEffect 来说，因为它的依赖是空数组，只在组件初始化时执行，可以理解为 useEffect 对应的 hook 节点不需要更新，直接复用旧的 useEffect 对应的 hook 节点；在旧节点中 setInterval 里的回调函数对于 count 变量的使用也还是保持原样，所以形成了闭包。而 setCount 传入的是更新函数，可以自动获取 preState、没有使用闭包的变量 count，所以不影响渲染。

#### 闭包的解决方法

1. useEffect 添加依赖，保证每次更新时替换 hook 缓存的函数，读取到的是最新的 state.

2. 使用 useRef 存储最新的 count。useRef 返回的始终是同一个 ref 对象，在组件的整个生命周期中是不变的，也就是地址是没变的；既然地址没变，通过 ref 对象的 current 属性存储最新的 state，就可以保证每次通过 ref.current 拿到的值就是最新的

组件库 ahook 的 useLatest 就是利用 useRef 这一特性。其源码为：

```js
import { useRef } from "react";

// 通过 useRef，保持每次获取到的都是最新的值
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export default useLatest;
```

## useEffect

使用示例：

```
useEffect(()=>{
    ...
    return ()=>{}
},[variable])
```

第一参数的回调函数函数可以没有返回值，第二参数的书写不是必要的，如果设置了变量 variable，当且仅当 variable 改变时才会触发第一参数回调

### useEffect 与生命周期关系

#### useEffect 实现 componentDidMount

useEffect 的第二个参数设置为一个空数组时，初始化调用一次之后不再执行回调，相当于周期 componentDidMount

```
useEffect(() => {
    console.log('hello world')
}, [])
```

#### useEffect 实现 componentDidMount 和 componentDidUpdate

当 useEffect 没有第二个参数时,组件的初始化和更新都会执行。
当 useEffect 有第二个参数时,组件的更新仅当 variable 改变时会执行。

#### useEffect 实现 componentDidMount 和 componentWillMount

useEffect 设置返回一个函数，这个函数在组件卸载时会执行。

```
useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // Specify how to clean up after this effect:
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
},[]);
```

### useEffect 无限循环陷阱

```
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({ hits: [] });

  useEffect(async () => {
    const result = await axios(
      'http://localhost/api/v1/search?query=redux',
    );

    setData(result.data);
  });

  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}

export default App;
```

以该组件为例，初次渲染执行 useEffect 内部请求、返回数据后，由于使用了 setData 组件 state 改变，引起重新渲染，同时由于 useEffect 没有依赖项，再次渲染时仍然会触发内部的回调，因此出现了无限循环的问题。

解决方式：如果只希望在组件 mount 时执行请求，可以传递一个空数组作为 useEffect 的第二个参数

### useEffect 与 async 同时使用时的报错

async 函数会返回 promise，但 useEffect 只允许返回一个清除函数，所以在控制台可以看到警告提醒
{% note info %}
Warning: useEffect function must return a cleanup function or nothing. Promises and useEffect(async () => …) are not supported, but you can call an async function inside an effect
{% endnote %}
解决方式：async 函数的定义分离出 useEffect 回调函数，回调函数内部执行 async 函数。

### useEffect vs useLayoutEffect

执行时期：useEffect 在全部渲染完毕后才会执行，useLayoutEffect 会在浏览器布局之后，绘制之前执行
执行方式：useEffect 异步，useLayoutEffect 同步

## useMemo

使用示例：

```
const memo=useMemo(()=>{
    ...
    return compute(props.v)
},[variable])
```

传入 useMemo 的函数会在渲染期间执行。如果没有设置第二参数依赖变量，则每次渲染都会执行第一参数的函数来计算。类比生命周期就是 shouldComponentUpdate
适用场景：
（1）父组件将某个值传给子组件、且父组件有频繁更新的情况。父组件其他值变化时，子组件同样也会重新渲染。因此可以使用 useMemo、将依赖设置为父组件传递的值，只有当其发生变化时子组件才更新。
（2）组件内部计算成本比较高的逻辑。需要通过控制依赖来减少不必要的计算。
注意点：
（1）useMemo 内部不要使用 setState 相关操作，会导致无限循环
（2）包括后面的 useCallback，如果是用在父子组件传值的场景，子组件通常用高阶函数 React.memo 包裹
**辨析：React.memo 和 useMemo**
React.memo：高阶组件，基础思想：props 没有改变则无需渲染组件。使用方法：`React.memo(Component, [areEqual])`其中 areEqual 函数不是必须要有的，当 props 浅比较无法实现预计的更新逻辑时才需要传入自己手写的比较逻辑。

useMemo：组件初次渲染时，执行一次包裹的函数，把函数返回值缓存起来。当组件重新渲染时，通过浅比较检查依赖数组 dependencies 有没有变化。如果没有直接返回之前缓存的结果。

## useCallback

使用示例：

```
const fn=useCallback(()=>{
    ...
    doSomething(variable)
},[variable])
```

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)。类似生命周期 shouldComponentUpdate
适用场景：
（1）父组件将某个函数传给子组件、且父组件有频繁更新的情况。父组件其他值变化时，由于函数重新创建等原因子组件同样也会重新渲染。
（2）useEffect 中可能会有依赖函数的场景，需要使用 useCallback 缓存函数，避免 useEffect 的无限调用

## useRef

使用示例：

```
const refContainer = useRef(initialValue);
```

输入参数 initialValue 将赋给 ref 的 current 属性。ref 作用于 HTML 元素时 ref 接收底层 DOM 元素作为其 current 属性；作用于组件时，ref 对象接收组件的挂载实例作为其 current 属性。
useRef() 和自建一个 {current: ...} 对象的唯一区别是，useRef 会在每次渲染时返回同一个 ref 对象。
适用场景：
（1）引用如 input 等有参数频繁变动更新的 dom 元素。
（2）解决闭包问题，见 react 闭包的内容介绍
（3）自定义组件时提供了传入函数的入参、为防止自定义组件依赖入参函数的情况使用useRef包裹


## 参考文献

（1）[useEffect 你真的会用吗？](https://juejin.cn/post/6952509261519781918#heading-0)
（2）[React Hooks 及其性能优化之 React.memo,useCallBack,useMemo](https://juejin.cn/post/7053695602370019335)
（3）[解读 useMemo, useCallback 和 React.memo，不再盲目做优化](https://juejin.cn/post/7090820276547485709)
（4）[React系列- 图解：React Hook闭包问题](https://juejin.cn/post/7239584269894189115?searchId=20230907171414B7126D9CD38D0536A22D)
（5）[useEffect 你真的会用吗？](https://juejin.cn/post/6952509261519781918#heading-0)
