---
title: node.js
date: 2023-02-26 16:50:00
categories:
  - 前端基础
tags:
  - node.js
---

node 基础知识记录

<!-- more -->

## node 模块机制

### require 的模块加载机制

1. 先计算模块路径
2. 如果模块在缓存里面，取出缓存
3. 加载模块
4. 输出模块的 exports 属性即可

### module.exports vs exports

- exports 其实就是 module.exports，引用相同（module.exports 默认提供了空对象）
- module.exports 可以直接赋值，exports 不可以，只能以增加健值的方式（模块加载时返回的是 module.exports 的内容）
- 如果要输出一个函数或数组，必须直接对 module.exports 对象赋值

### npm run XXX 的流程

- 运行 npm run xxx 的时候，npm 会先在当前目录的 node_modules/.bin 查找要执行的程序，如果找到则运行；
- 没有找到则从全局的 node_modules/.bin 中查找，npm i -g xxx 就是安装到到全局目录；
- 如果全局目录还是没找到，那么就从 path 环境变量中查找有没有其他同名的可执行程序。

## node 进程和线程

### 进程和线程辨析

进程：资源分配的最小单位，进程是线程的容器。
线程：操作系统能够进行运算调度的最小单位。线程是隶属于进程的，被包含于进程之中。一个线程只能隶属于一个进程，但是一个进程是可以拥有多个线程的。

概念区分：
Node.js 是单线程 —— 因为使用的语言是 JavaScript，JavaScript 是单线程的，所以 Node.js 也是单线程的。

启动的服务是多线程 —— Node 中最核心的是 v8 引擎，v8 是一个执行 JS 的引擎. 也就是翻译 JS. 包括我们熟悉的编译优化, 垃圾回收等等.在 Node 启动后，会创建 v8 的实例，这个实例是多线程的（包括主线程、编译/优化线程、分析器线程、垃圾回收的几个线程）。

### node 多进程架构

使用 child_process、cluster 开启多个进程实现多进程单线程模式，使 CPU 的利用率提升。子进程独立于父进程

### 创建子进程方法

模块 child_process 具有以下方法：

- spawn()： 启动一个子进程来执行命令
- exec(): 启动一个子进程来执行命令，与 spawn()不同的是其接口不同，它有一个回调函数获知子进程的状况
- execFlie(): 启动一个子进程来执行可执行文件
- fork(): 与 spawn()类似，不同在于它创建 Node 子进程需要执行 js 文件

## express vs koa

### 中间件

Express 中间件实现是基于 Callback 回调函数同步的，它不会去等待异步（Promise）完成
Koa 的中间件机制中使用 Async/Await（背后全是 Promise）以同步的方式来管理异步代码

#### 中间件原理

内部维护一个函数数组，这个函数数组表示在发出响应之前要执行的所有函数，也就是中间件数组使用 app.use(fn)后，传进来的 fn 就会被扔到这个数组里，执行完毕后调用 next()方法执行函数数组里的下一个函数，如果没有调用 next()的话，就不会调用下一个函数了，也就是说调用就会被终止

### 洋葱模型实现
Koa 的中间件是按顺序执行的，每个中间件可以对请求进行处理，并且在适当的时候将控制权交给下一个中间件。当所有中间件都执行完后，再一层一层地返回响应，类似剥洋葱。

中间件执行过程：
请求进入：请求到达服务器时，按照注册的顺序，依次进入每个中间件。
调用 await next()：在中间件函数内部调用 await next() 时，控制权被传递给下一个中间件，直到最后一个中间件完成。
返回阶段：当所有中间件执行完毕，控制流回溯，逐个返回响应的处理，类似洋葱剥皮的过程。

```JavaScript
/**
 * 中间件组合函数，可以参考 https://github.com/koajs/compose/blob/master/index.js
 * @param { Array } middlewares
 */
function compose(ctx, middlewares) {
  // {1}
  if (!Array.isArray(middlewares)) throw new TypeError('Middlewares stack must be an array!')

  // {2}
  for (const fn of middlewares) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function() {
    const len = middlewares.length; // {3} 获取数组长度
    const dispatch = function(i) { // {4} 这里是我们实现的关键
      if (len === i) { // {5} 中间件执行完毕
        return Promise.resolve();
      } else {
        const fn = middlewares[i]; // {6}

        try {
          // {7} 这里一定要 bind 下，不要立即执行
          return Promise.resolve(fn(ctx, dispatch.bind(null, (i + 1))));
        } catch (err) {
          // {8} 返回错误
          return Promise.reject(err);
        }
      }
    }

    return dispatch(0);
  }
}

const fn = compose(ctx, middlewares);

fn();

```

## 数据库比较：mysql vs mongodb

### 特点

**MySQL**

- 关系型数据库，存储结构化数据
- 可以通过外键，主键将不同表中的属性关联起来
- 读取数据可以使用 sql
- 需通过新增服务器配置来支持规模扩张

**MongoDB**

- 非关系型数据库，可以在不首先定义结构的情况下创建记录
- 不支持表关联
- 不能用 sql 查询
- 可通过新增服务器实现扩展，解决大量查询问题

### 术语对比

|    MySQL    |   MongoDB   |                               说明                               |
| :---------: | :---------: | :--------------------------------------------------------------: |
|  database   |  database   |                              数据库                              |
|    table    | collection  |                             表/集合                              |
|     row     |  document   |                             行/文档                              |
|   column    |    field    |                             字段/域                              |
|    index    |    index    |                               索引                               |
|    join     |  嵌入文档   | 表关联/MongoDB 不支持 join，MongoDB 通过嵌入式文档来替代多表连接 |
| primary key | primary key |              主键/MongoDB 自动将\_id 字段设置为主键              |

## 参考文献

(1)[NodeJS 有难度的面试题，你能答对几个？](https://juejin.cn/post/6844903951742025736)
(2)[挑战一轮大厂后的面试总结 (含六个方向) - nodejs 篇](https://juejin.cn/post/6844904071501971469)
(3)[三面面试官：运行 npm run xxx 的时候发生了什么？](https://juejin.cn/post/7078924628525056007)
(4)[多维度分析 Express、Koa 之间的区别](https://juejin.cn/post/6844904099767386126)
