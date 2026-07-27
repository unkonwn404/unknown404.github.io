---
title: react中获取ref相关的函数总结
date: 2022-12-09 14:15:58
tags:
  - React
categories:
  - 前端技术体系
---

虽然 react 中很少使用操作 DOM 的逻辑，但为了能够理解开源代码，还是整理记录了常用的几个相关函数。

<!-- more -->


## 获取 react 元素

### createRef

#### 特点

1. 常用于 class 组件（函数组件也可以用）
2. 可获取原生 DOM 和自定义 class 组件的引用

```
//父组件
class AutoFocusTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  componentDidMount() {
    this.textInput.current.focusTextInput();
  }

  render() {
    return (
      <CustomTextInput ref={this.textInput} />
    );
  }
}
//子组件
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    // 创建一个 ref 来存储 textInput 的 DOM 元素
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // 直接使用原生 API 使 text 输入框获得焦点
    // 注意：我们通过 "current" 来访问 DOM 节点
    this.textInput.current.focus();
  }

  render() {
    // 告诉 React 我们想把 <input> ref 关联到
    // 构造器里创建的 `textInput` 上
    return (
      <div>
        <input
          type="text"
          ref={this.textInput} />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```

3. createRef 每次渲染都会返回一个新的引用

#### 实现代码

```
const createRef = ()=>{
    return { current: null }
}
```

### useRef

#### 特点

1. 只能用于函数组件
2. useRef 的引用存在于组件的整个生命周期

#### 实现代码

```
let obj = { current: null }

const useRef = ()=>{
    return obj
}
```

> **createRef 与 useRef 区别**
> 虽然都是用于创建 ref 属性、访问 DOM 实例对象，但两者适用的组件语法略有差异：createRef 更适用于 class 组件，由于其并没有 Hooks 的效果，其内部的值会随着函数组件重复执行而不断被初始化，而在 class 组件中由于分离了生命周期，使初始化时机仅执行一次。

以下面的代码为例：

```
const { createRoot } = ReactDOM;
const { useRef, useState, createRef } = React;

const App = ()=>{
   const [renderIndex,setRenderIndex] = useState(1);
    const refFromUseRef = useRef();
   const refFromCreateRef = createRef();


    if (!refFromUseRef.current){
       refFromUseRef.current=renderIndex
   }
    if (!refFromCreateRef.current) {
        refFromCreateRef.current = renderIndex
    }

    return <>
        <p>index {renderIndex}</p>
        <p>refFromUseRef {refFromUseRef.current}</p>
        <p>refFromCreateRef {refFromCreateRef.current}</p>
        <button onClick={() => { setRenderIndex(p=>p+1)}}>a</button>
    </>
}
const ComponentDemo = App;
createRoot(mountNode).render(<ComponentDemo />);

```

在执行的过程中会发现即使组件重新渲染, 由于 refFromUseRef 的值一直存在(类似于 this ) , 无法重新赋值；而 refFromCreateRef 会随组件渲染不断改变引用值。

## 父组件获取子组件内部的一个元素

### forwardRef

获取函数子组件内部元素的 ref 得用 forwardRef，因为 ref 不像 props 作为参数可以传递。

```
// 父元素。可以直接获取 DOM button 的 ref：
const App=()=>{
    const ref = React.createRef();
    return (<FancyButton ref={ref}>Click me!</FancyButton>)
}

//子元素
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));
```

## 父组件获取子组件内部多个元素/方法

### useImperativeHandle

useImperativeHandle 需要和 forwardRef 结合使用。可以让你在使用 ref 时自定义暴露给父组件的实例值。

```
const FancyInput= React.forwardRef(props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
```

本例中渲染` <FancyInput ref={inputRef} />` 的父组件可以调用 inputRef.current.focus()。

## 参考文献

（1）[什么是 useRef , useRef 与 createRef 区别, 以及在什么情况下使用 useRef](https://blog.csdn.net/frontend_frank/article/details/104243286)
（2）[精读《useRef 与 createRef 的区别》](https://juejin.cn/post/6844904079164964878)
（3）[一文学会 useImperativeHandle](https://juejin.cn/post/7146095092674068487)
