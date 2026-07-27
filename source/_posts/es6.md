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

## let,const

创建块级作用域，若调用发生在声明前会暂时性死区
const 指向地址不能改变，但可以增加内部属性

## 箭头函数

特点：没有 this 和 arguments；不能作为构造函数；没有函数提升
与普通函数本质区别：主要在于 this 的绑定方式。普通函数的 this 指向在运行时动态确定，取决于调用方式，而箭头函数的 this 是在定义时从外层作用域继承而来，不会随着调用方式的改变而改变。

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
- Proxy 有 13 种拦截方法，如 ownKeys、deleteProperty、has 等是 Object.defineProperty 不具备的。
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

导入导出方式：
commonJs：require、module.exports、exports
es6：import、export、export default

### commonJs vs ES6

1. commonJs 输出是值的拷贝，es6 输出值的引用
2. commonJs 模块运行时加载（先加载全部模块再导入方法），es6 模块是编译时加载（指定加载某输出值）
3. commonJs 同步导入，es6 模块异步导入

### 其他模块化方法特点

amd ：应用实例 requireJs。特点：依赖预加载；依赖模块加载完成后就直接执行依赖模块，依赖模块的执行顺序和我们书写的顺序不一定一致（依赖前置、提前执行）
cmd ：应用实例 seaJs。特点：就近依赖，按需加载；模块加载完成后并不执行，只是下载而已，等到所有的依赖模块都加载好后，进入回调函数逻辑，遇到 require 语句的时候执行依赖模块（依赖就近、延迟执行）
umd：通用模块定义规范，兼容之前提到的模块规范 amd 和 commonJs 及全局变量。在 webpack 项目调用 umd 模块时工具自动处理，使得 import 语句能够正常工作 ‌

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

#### Promise.all 简易实现

函数返回一个 promise，每个异步任务进入 resolve 态时计数都加 1，只有当计数与异步任务总数一致时返回的 promise 的状态置为 resolved

```js
function promiseAll(promises) {
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(promises)) {
      throw new TypeError(`argument must be a array`);
    }
    var resolvedCounter = 0;
    var promiseNum = promises.length;
    var resolvedResult = [];
    for (let i = 0; i < promiseNum; i++) {
      Promise.resolve(promises[i]).then(
        (value) => {
          resolvedCounter++;
          resolvedResult[i] = value;
          if (resolvedCounter == promiseNum) {
            return resolve(resolvedResult);
          }
        },
        (error) => {
          return reject(error);
        }
      );
    }
  });
}
```

#### Promise.race 简易实现

因为 Promise 的状态只能改变一次, 那么我们只需要把 Promise.race 中产生的 Promise 对象的 resolve 方法, 注入到数组中的每一个 Promise 实例中的回调函数中即可.

```js
Promise.race = function (args) {
  return new Promise((resolve, reject) => {
    for (let i = 0, len = args.length; i < len; i++) {
      args[i].then(resolve, reject);
    }
  });
};
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

## for in 和 for of 区别

- for in：用于遍历对象的可枚举属性（包括原型链上的属性），也可以用于数组。不过，当用于数组时，它遍历的是数组的索引而不是元素。
- for of：用于遍历可迭代对象（例如数组、字符串、Map、Set 等）。它遍历的是可迭代对象的值，不适合遍历对象的属性。

## 参考文献

1）[《模块化系列》彻底理清 AMD,CommonJS,CMD,UMD,ES6](https://zhuanlan.zhihu.com/p/108217164)
