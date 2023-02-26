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

### node 多进程架构

使用 child_process 开启多个进程实现多进程单线程模式，使 CPU 的利用率提升。子进程独立于父进程

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
### 洋葱模型实现
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

## 参考文献

(1)[NodeJS 有难度的面试题，你能答对几个？](https://juejin.cn/post/6844903951742025736)
(2)[挑战一轮大厂后的面试总结 (含六个方向) - nodejs 篇](https://juejin.cn/post/6844904071501971469)
(3)[三面面试官：运行 npm run xxx 的时候发生了什么？](https://juejin.cn/post/7078924628525056007)
(4)[多维度分析 Express、Koa 之间的区别](https://juejin.cn/post/6844904099767386126)
