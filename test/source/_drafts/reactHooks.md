---
title: React Hooks
tags:
---
记录常用的React钩子的使用方法。

## React Hook规则
（1）只在最顶层使用 Hook：不要在循环，条件或嵌套函数中调用 Hook
（2）只在 React 函数中调用 Hook：可以在React组件或自定义钩子中调用

## useState
使用示例：
```
[selfState,setSelfState]=useState(initialState)
```
输入参数：初始状态initialState。如果initialState需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用。
返回参数：当前状态名selfState和更新状态函数名setSelfState
setSelfState可以传入新值来变更状态setSelfState(newState)；如果需要根据先前的状态更新状态，也可以使用回调函数setSelfState(prevState => newState)
注意点：
（1）因为 state 只在组件首次渲染的时候被创建。在下一次重新渲染时，useState 返回给我们当前的 state。
（2）initialState可以是数组或对象，不像 class 中的 this.setState，更新 state 变量总是替换它而不是合并它。
（3）过时状态问题：class和hooks的写法里，setTimeout 取到的都是旧值，是因为 react 中一直遵循一个原则，即 state 指向的内容是不可变的，所以每一次 state 的更新都是指向变了。因为闭包的原因，setTimeout中依然指向的原来的对象，所以旧的state没有释放，所以会取到旧值。
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
以上代码点击多次时不能正确记录点击次数。解决方法是使用setCount(count => count + 1)，这样不依赖外部变量、确保将最新状态值作为参数提供给更新状态函数，过时闭包的问题解决了。
## useEffect
使用示例：
```
useEffect(()=>{
    ...
    return ()=>{}
},[variable])
```
第一参数的回调函数函数可以没有返回值，第二参数的书写不是必要的，如果设置了变量variable，当且仅当variable改变时才会触发第一参数回调
### useEffect与生命周期关系
#### useEffect实现componentDidMount
useEffect的第二个参数设置为一个空数组时，初始化调用一次之后不再执行回调，相当于周期componentDidMount
```
useEffect(() => {
    console.log('hello world')
}, [])
```
#### useEffect实现componentDidMount和componentDidUpdate 
当useEffect没有第二个参数时,组件的初始化和更新都会执行。
当useEffect有第二个参数时,组件的更新仅当variable改变时会执行。

#### useEffect实现componentDidMount和componentWillMount
useEffect设置返回一个函数，这个函数在组件卸载时会执行。
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
### useEffect无限循环陷阱
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
以该组件为例，初次渲染执行useEffect内部请求、返回数据后，由于使用了setData组件state改变，引起重新渲染，同时由于useEffect没有依赖项，再次渲染时仍然会触发内部的回调，因此出现了无限循环的问题。

解决方式：如果只希望在组件mount时执行请求，可以传递一个空数组作为useEffect的第二个参数
### useEffect与async同时使用时的报错
async函数会返回promise，但useEffect只允许返回一个清除函数，所以在控制台可以看到警告提醒
{% alert info  %}
Warning: useEffect function must return a cleanup function or nothing. Promises and useEffect(async () => …) are not supported, but you can call an async function inside an effect
{% endalert %} 
解决方式：async函数的定义分离出useEffect回调函数，回调函数内部执行async函数。
### useEffect vs useLayoutEffect
执行时期：useEffect 在全部渲染完毕后才会执行，useLayoutEffect 会在浏览器布局之后，绘制之前执行
执行方式：useEffect异步，useLayoutEffect同步

## 参考文献
（1）[useEffect你真的会用吗？](https://juejin.cn/post/6952509261519781918#heading-0)