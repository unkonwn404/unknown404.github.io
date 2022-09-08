---
title: ES6语法
date: 2022-08-29 17:01:20
categories:
  - 前端基础
tags:
  - ES6
  - JavaScript
---

面试时常问的 ES6 特性

<!-- more -->
<!-- toc -->

## let,const

创建块级作用域，若调用发生在声明前会暂时性死区
const 指向地址不能改变，但可以增加内部属性

## 箭头函数

特点：没有 this 和 arguments；不能作为构造函数；没有函数提升

```
let obj = {
 name: 'Tyler',
 a: function () {
  let name = 'Anderson'
  let test = () => {
   console.log(this.name)
  }
  test()
 },
}
obj.a()

// Tyler
// 找到最近的非箭头函数a，所以箭头函数的this 就是a 的this。
// a目前是由obj调用的，因此此时箭头函数的this 为obj
```

## Proxy

使用方法：const proxy = new Proxy(target, handler)
输入参数：

- target：拦截的目标对象
- handler：定制拦截行为

### Proxy 与 Object.defineProperty 对比

Proxy 的优点：

- Proxy 可以直接监听整个对象而非属性。
- Proxy 可以直接监听数组的变化。
- Proxy 有 13 中拦截方法，如 ownKeys、deleteProperty、has 等是 Object.defineProperty 不具备的。
- Proxy 返回的是一个新对象，我们可以只操作新的对象达到目的，而 Object.defineProperty 只能遍历对象属性直接修改;
- Proxy 做为新标准将受到浏览器产商重点持续的性能优化,也就是传说中的新标准的性能红利。

Object.defineProperty 的优点：

- 兼容性好，支持 IE9，而 Proxy 的存在浏览器兼容性问题,而且无法用 polyfill 磨平。

Object.defineProperty 的缺点：

- Object.defineProperty 只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历。
- Object.defineProperty 不能监听数组。是通过重写数据的那 7 个可以改变数据的方法来对数组进行监听的。
- Object.defineProperty 也不能对 es6 新产生的 Map,Set 这些数据结构做出监听。
- Object.defineProperty 也不能监听新增和删除操作，通过 Vue.set()和 Vue.delete 来实现响应式的。

## 模块化

导入导出方式：import、export

### commonJs vs ES6

1. commonJs 输出是值的拷贝，es6 输出值的引用
2. commonJs 模块运行时加载（先加载全部模块再导入方法），es6 模块是编译时加载（指定加载某输出值）
3. commonJs 同步导入，es6 模块异步导入

### 其他模块化方法特点

amd 和 requireJs：依赖前置，提前执行
cmd 和 seaJs：依赖后置，延迟执行
umd：通用模块定义规范

## 异步编程

### promise

3 种状态：1）pending；2）resolved；3）rejected
特点：1）立即执行；2）then 异步回调；3）状态不可逆；4）链式调用

#### promise 简易实现

```
function myPromise(fn) {
    const that = this
    that.state = 'pending'
    that.value = null
    that.resolvedCallbacks = []
    that.rejectedCallbacks = []

    function resolve(value) {
        if (that.state === 'pending') {
            that.state = 'resolved'
            that.value = value
            that.resolvedCallbacks.map(cb => cb(value))
        }
    }

    function reject(value) {
        if (that.state === 'pending') {
            that.state = 'rejected'
            that.value = value
            that.rejectedCallbacks.map(cb => cb(value))
        }
    }
    try {
        fn(resolve, reject)
    } catch (e) {
        reject(e)
    }
}
myPromise.prototype.then = function (onFulfilled, onRejected) {
    const that = this
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e =>
        throw e
    if (that.state === 'resolved') onFulfilled(that.value)
    if (that.state === 'rejected') onRejected(that.value)
}
```

### async await

generator 的语法糖。
async 声明 function 是一个异步函数，返回一个 promise 对象，可以使用 then 方法添加回调函数。
await 操作符只能在异步函数 async function 内部使用。await 会阻塞后面的代码，等待接在 await 后面的表达式返回 Promise 对象结果。

## 数据类型 Set、Map

### Set 和 weakSet、Map 和 WeakMap 区别

weakSet 结构与 Set 类似，是不重复值集合，但 weakSet 只能是对象且为弱引用，且不可遍历
weakMap 结构与 Map 类似，但 weakMap 只接受对象为键名，键名是对象弱引用，且不可遍历

### Map 和 Object 的区别

1）Key filed：在 Object 中， key 必须是简单数据类型（整数，字符串或者是 symbol），而在 Map 中则可以是 JavaScript 支持的所有数据类型，也就是说可以用一个 Object 来当做一个 Map 元素的 key。
2）元素顺序：Map 元素的顺序遵循插入的顺序，而 Object 的则没有这一特性。
3）初始化、增查删改方式
