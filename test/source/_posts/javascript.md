---
title: Javascript基础
tags:
  - JavaScript
excerpt: <p>前端面试常考内容之JavaScript。</p>
categories:
  - 前端基础
date: 2022-06-18 20:58:57
---

<!-- toc -->

## js 简介

"解释型语言"，是通过解释器来实现的。运行过程：JS 代码->解析成 AST (期间伴随词法分析、语法分析)->生成字节码（V8）->生成机器码（编译器）

## js 数据类型

- 基本类型：null,undefined,string,bool,number,bigInt,symbol
- 引用类型：object,array,date

存储位置：

- 基本类型：栈，占据空间小，大小固定
- 引用类型：堆，占据空间大，大小不固定；栈中存储指向实体起始地址

null vs undefined：null 是空对象，undefined 是声明的变量未定义

## js 类型判断

### typeof

适用于判断基本类型，除 typeof null==‘object’其他都可以识别

### instanceof

使用于判断引用类型，其原理是是判断在其原型链中能否找到该类型的原型。

```
function myInstanceOf(left,right){
  var prototype=right.prototype
  var left=left._proto_
  while(true){
    if(left==null||left==undefined)return false;
    if(left==prototype)return true;
    left=left._proto_
  }
}
```

### Object.prototype.toString.call

辨析：为什么不直接用 obj.toString？
Array、Function 类型作为 Object 实例重写了 toString 方法

### 延伸问题：数组判断

1. Array.isArray（arr）
2. arr instanceof Array
3. Object.prototype.toString.call（arr）

## js 类型转换

### 其他类型转换为 boolean

|               原类型               | boolean |
| :--------------------------------: | :-----: |
| false、null、undefined、0、''、NaN |  false  |
|                其他                |  true   |

### 其他类型转换为 number

|  原类型   | number |
| :-------: | :----: |
| undefined |  NaN   |
|   null    |   0    |
|   false   |   0    |
|   true    |   1    |
|  string   |  NaN   |
|    ''     |   0    |
| 非空对象  |  NaN   |

### 其他类型转换为 string

|  原类型   |      string       |
| :-------: | :---------------: |
| undefined |    'undefined'    |
|   null    |      'null'       |
|   false   |      'false'      |
|   true    |      'true'       |
|  number   |    `${number}`    |
|  [ 1,2 ]  |       '1,2'       |
| 非空对象  | [ object Object ] |

### ==强制转换规则

{% image center clear type-change.jpeg  %}
如图所示，主要有以下几个步骤：

1. 类型是否相同
2. 是否 null==undefined
3. string==number？是的话统一 number
4. 是否有 boolean？有的话 boolean 转 number
5. object==string/number/symbol？是的话 object 返回原始类型比较
6. 返回 false

#### object 转原始类型

1. 调用 valueOf，如果转换为基础类型，则返回
2. 调用 toString，如果转换为基础类型，则返回
3. 报错

#### ==与 Object.is 的区别

==存在隐形类型转换
使用 Object.is 来进行相等判断时，一般情况下和三等号的判断相同，即不存在类型转换。它处理了一些特殊的情况，比如 -0 和 +0 不再相等，两个 NaN 是相等的。

### 四则运算转换

1）+情况一方是字符串，则字符串拼接；如果一方不是字符串或者数字，那么会将它转换为数字或者字符串
2）其他情况存在数字另一方则转数字

## 对象拷贝

### 浅拷贝

定义：拷贝对象间享有相同的引用数据

1. **Object.assign**
2. **...展开扩展符**
3. **slice、concat**

### 深拷贝

定义：两个对象有各自的存储区间

1. **JSON.stringify**
   缺点：不能拷贝函数和循环引用
2. 递归函数

```
function deepCloneObj(obj){
  var newObj=Array.isArray(obj)?[]:{}
  for(let key in obj){
    if(obj.hasOwnProperty(key)){
      newObj[key]=typeof obj[key]=='object'?deepCloneObj(obj[key]):obj[key]
    }
  }
  return newObj
}
```

## 原型和原型链

**原型**：*proto*指向的对象
**原型链**：当对象某一属性在当前对象找不到时会沿*proto*属性向上一个对象查找，如果没有就沿着*proto*属性继续向上查找，这个查找依据的规则就是原型链
{% image center clear proto-pic.jpg  %}

## 继承

### 原型链继承

```
Child.prototype=new Parent()
```

基本思路：利用原型让一个引用类型继承另一个引用类型的属性和方法
特点：引用类型被共享，不可向父实例传参

### 构造函数继承

```
function Child(){
  Parent.call(this)
}
```

基本思路：在子类型的构造函数中调用超类型构造函数
特点：每次创建实例都会创建一次方法，不能继承原型属性或者方法。

### 组合继承（原型链继承+构造函数继承）

```
function Child(){
  Parent.call(this)
}
Child.prototype=new Parent()
Child.prototype.constructor=Child
```

基本思路：使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。
特点：调用了两次父类函数

### 原型继承

```
function object(o){
    function F(){};
    F.prototype = o;
    return new F();
}
```

基本思路：可以基于已有的对象创建新的对象，同时还不必因此创建自定义类型。
特点：可以实现基于一个对象的简单继承，不必创建构造函数；但缺点类似原型链继承

### 寄生式继承

基本思路：创建一个仅用于封装继承过程的函数，该函数在内部以某种方式增强对象，最后返回这个对象。
特点：在主要考虑对象而不是自定义类型和构造函数的情况下，实现简单的继承；缺点类似构造函数继承

### 寄生组合型继承

```
function extend(subClass,superClass){
  var f=function(){}//预防子类原型和父类原型共用，原型链不清
  f.prototype=superClass.prototype
  subClass.prototype=new f()
  subClass.prototype.constructor=subClass
  return subClass
}
```

基本思路：继承原型时，继承的不是超类的实例对象，而是原型对象是超类原型对象的一个实例对象，这样就解决了基类的原型对象中增添了不必要的超类的实例对象中的所有属性的问题。
特点：解决了组合型调用 2 次父类构造函数的问题

## this

### this 的指向

this 指向最后调用它的对象

### 改变 this 指向的方法

1）箭头函数 2）call、apply、bind 3）new

### this 绑定

显式绑定：call、apply、bind
隐式绑定：直接被对象所包含的函数调用时
默认绑定：全局环境默认绑定到 window
new 绑定

### call 和 apply 区别

传入的参数不同，apply 传入 this 指向和参数数组（或类数组）两个变量；call 传入 this 指向和其他参数，传入的参数数量不固定

### call、apply、bind 的实现

1. call

```JavaScript
Function.prototype.call=function(context){
  var context=context||window
  context.fn=this
  var args=[...arguments].slice(1)
  var res=context.fn(...args)
  delete context.fn
  return res
}
```

2. apply

```JavaScript
Function.prototype.apply=function(context){
  var context=context||window
  context.fn=this
  var res
  if(arguments[1]){
    res=context.fn(...args)
  }else{
    res=context.fn()
  }
  delete context.fn
  return res
}
```

3. bind

```JavaScript
Function.prototype.bind=function(context){
  var args=[...arguments].slice(1),_this=this
  return function F(){
    // 函数作为构造函数时this指向改变
    if(this instanceof F){
      return new F(...args,...arguments)
    }
    return _this.apply(context,args.concat(...arguments))
  }
}
```

bind 多次时 this 的指向以第一次为准

### new 的过程

1. 创建新对象
2. 对象原型指向构造函数 prototype
3. 改变 this 指向
4. 返回对象

```JavaScript
function create(){
  var obj={},Construct=[].shift.call(arguments)
  obj._proto_=Construct.prototype
  var res=Construct.apply(obj,arguments)
  return typeof res==='object'?res:obj
}
```

## 作用域相关

作用域：源码中定义变量的区域
词法作用域：函数的作用域在函数定义时决定
动态作用域：函数的作用域在函数调用时决定
**js 采用的是静态作用域，即函数的作用域在函数定义时就确定了。**

### 执行上下文

定义：当前代码的执行环境，包括全局上下文、函数上下文、eval 上下文

#### 执行上下文 3 个重要属性

1. 变量对象（VO）：存储了上下文定义的变量和函数声明
2. 作用域链：一组对象列表，包括自身变量对象和指向父级变量对象作用域链属性
3. this

#### 执行过程

1. 进入执行上下文阶段
   变量对象内容：

- 1）函数所有形参
- 2）函数声明：由函数名+对应值变成变量对象属性；若变量对象由同名属性，则替换该属性
- 3）变量声明：由变量名+undefined 变成变量对象属性；若变量名称与函数或形参相同，则不干扰已存在属性

2. 代码执行：根据代码修改变量对象的值
   PS：函数上下文的变量对象初始化只包括 arguments

### 闭包

定义：可以获取其他函数内变量的函数
优点：1.可创建私有变量；2.防止全局变量污染；3.模仿块级作用域
缺点：容易内存泄露（eg.意外的全局变量、定时器未及时清理、闭包循环引用）

### 偏函数与柯里化

偏函数：将一个 n 元函数转为 n-x 函数

```JavaScript
function partial(fn){
  var args=[...arguments].slice(1)
  return function(){
    var newArgs=args.concat([...arguments])
    return fn.apply(this,newArgs)
  }
}
```

柯里化：将一个 n 元函数转为 n 个一元函数

```JavaScript
function curry(fn){
  var args=[...arguments].slice(1)
  return function(){
    var newArgs=args.concat([...arguments])
    if(newArgs.length<fn.length){
      return curry.call(this,fn,newArgs)
    }else{
      return fn.apply(this,newArgs)
    }
  }
}
```

### JavaScript 异步编程

#### 异步编程的实现方式

- **callback**：多个回调函数嵌套的时候会造成回调函数地狱
- **promise**：使用 Promise 的方式可以将嵌套的回调函数作为链式调用。
- **generator**：可以在函数的执行过程中，将函数的执行权转移出去，在函数外部还可以将执行权转移回来。当遇到异步函数执行的时候，将函数执行权转移出去，当异步函数执行完毕时再将执行权给转移回来。
- **async**：generator 和 promise 实现的一个自动执行的语法糖，它内部自带执行器，当函数内部执行到一个 await 语句的时候，如果语句返回一个 promise 对象，那么函数将会等待 promise 对象的状态变为 resolve 后再继续向下执行。因此可以将异步逻辑，转化为同步的顺序来书写，并且这个函数可以自动执行。

#### 事件循环

##### 浏览器事件循环

- macrotasks(宏任务):script(整体代码)、setTimeout、setInterval、setImmediate、I/O、UI rendering
- microtasks(微任务):process.nextTick、Promises、Object.observe、MutationObserver

###### 浏览器循环机制

JavaScript 有一个主线程和调用栈，所有的任务最终都会被放到调用栈等待主线程执行。宏任务会被放在调用栈中，按照顺序等待主线程依次执行。主线程之外存在一个回调队列，微任务有了结果后，会放入回调队列中。调用栈中任务执行完毕后，此时主线程处于空闲状态，会从回调队列中获取任务进行处理。上述过程不断重复。

- 首先执行同步代码，这属于宏任务
- 当执行完所有同步代码后，执行栈为空，查询是否有异步代码需要执行
- 执行所有微任务
- 当执行完所有微任务后，如有必要会渲染页面
- 然后开始下一轮 Event Loop，执行宏任务中的异步代码，也就是 setTimeout 中的回调函数

```JavaScript
console.log('script start')
async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end')
}
async1()

setTimeout(function() {
  console.log('setTimeout')
}, 0)
new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function() {
    console.log('promise1')
  })
  .then(function() {
    console.log('promise2')
  })
console.log('script end')
```

###### 概念区分：进程 vs 线程

进程：资源分配的基本单位
线程：cpu 调度的基本单位

#### nodejs 事件循环

nodejs 的事件循环主要分为 6 个阶段：

- timers 阶段：这个阶段执行 timer（setTimeout、setInterval）的回调
- I/O callbacks：执行一些系统调用错误，比如网络通信的错误回调
- idle,prepare：仅 node 内部使用
- poll：获取新的 I/O 事件, 适当的条件下 node 将阻塞在这里
  1）有到期的定时器，执行定时器回调
  2）处理 poll 队列：
  - 若队列为空：有 setImmediate 方法时 poll 阶段停止进入 check，执行回调；无 setImmediate 方法时等待新事件
  - 若队列不为空：遍历回调队列并同步执行
- check：执行 setImmediate() 的回调
- close callbacks：执行 socket 的 close 事件回调

{% image center clear eventLoop.png  %}

## 参考文献

（1）[「2021」高频前端面试题汇总之 JavaScript 篇（下）](https://juejin.cn/post/6941194115392634888)
