---
title: 面向面试的算法题
date: 2023-03-08 09:55:56
tags:
  - JavaScript
  - 算法
  - 面试
excerpt: 这一部分想不出来怎么描述了，就纯纯面向面试的算法题
categories:
  - 前端基础
---

## 常见面试题

### 1.数组展平

```
const flat = (array) => {
  return array.reduce(
    (acc, it) => acc.concat(Array.isArray(it) ? flat(it) : it),
    []
  );
};
const array = [1, [2, [3, [4, [5]]]]];
const flatArray = flat(array); // [1, 2, 3, 4, 5]
```

### 2.compose 函数实现

```
function compose(...funcs) {
    if (funcs.length === 0) {
        return arg => arg
    }

    if (funcs.length === 1) {
        return funcs[0]
    }

    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

### 3.限制并发请求数

```JavaScript
function multiRequest(urls = [], maxNum) {
  // 请求总数量
  const len = urls.length;
  // 根据请求数量创建一个数组来保存请求的结果
  const result = new Array(len).fill(false);
  // 当前完成的数量
  let count = 0;

  return new Promise((resolve, reject) => {
    // 请求maxNum个
    while (count < maxNum) {
      next();
    }
    function next() {
      let current = count++;
      // 处理边界条件
      if (current >= len) {
        // 请求全部完成就将promise置为成功状态, 然后将result作为promise值返回
        !result.includes(false) && resolve(result);
        return;
      }
      const url = urls[current];
      console.log(`开始 ${current}`, new Date().toLocaleString());
      fetch(url)
        .then((res) => {
          // 保存请求结果
          result[current] = res;
          console.log(`完成 ${current}`, new Date().toLocaleString());
          // 请求没有全部完成, 就递归
          if (current < len) {
            next();
          }
        })
        .catch((err) => {
          console.log(`结束 ${current}`, new Date().toLocaleString());
          result[current] = err;
          // 请求没有全部完成, 就递归
          if (current < len) {
            next();
          }
        });
    }
  });
}
```

### 4.树结构转换

非递归方法： 1.先构建 map 结构，以各个子项 id 为 key 2.再循环目标数组，判断上面构建的 map 中，是否存在当前遍历的 pid 3.存在就可以进行 children 的插入 4.不存在就是顶级节点，直接 push 即可

```js
let arr = [
  {
    id: 1,
    pid: 0,
    name: "body",
  },
  {
    id: 2,
    pid: 1,
    name: "title",
  },
  {
    id: 3,
    pid: 2,
    name: "div",
  },
];
function toTree(arr) {
  let res = [],
    map = {};
  arr.forEach((item) => (map[item.id] = item));
  arr.forEach((item) => {
    let parent = map[item.pid];
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    } else {
      res.push(item);
    }
  });
  return res;
}
```

### 5.数组相等判断

判断思路：1.数组长度是否相等；2.元素可重复的情况需要进行计数，最好用 Map 数据结构保存，以防数组中有 1 和‘1’两种元素、计数时会被混淆；3.边界问题考虑（NaN 等）

```js
function areArraysContentEqual(arr1, arr2) {
  // 数组长度是否相等
  if (arr1.length !== arr2.length) {
    return false;
  }

  // 创建计数对象，用于记录每个元素在数组中的出现次数
  const countMap1 = count(arr1);
  const countMap2 = count(arr2);

  // 统计数组中的元素出现次数
  function count(arr = []) {
    const resMap = new Map();
    for (const item of arr) {
      resMap.set(item, (resMap.get(item) || 0) + 1);
    }
    return resMap;
  }
  // 检查计数对象是否相等
  for (const [key, count] of countMap1) {
    if (countMap2.get(key) !== count) {
      return false;
    }
  }

  return true;
}

const array1 = ["apple", "banana", "cherry", "banana", 1, "1", "11", 11];
const array2 = ["banana", "apple", "banana", "cherry", "1", 1, "11", 11];

areArraysContentEqual(array1, array2); // true
```

### 6.发布订阅模式

```js
class EventEmitter {
  constructor() {
    this.events = {}; // 存储事件与回调
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 取消订阅
  off(eventName, callback) {
    if (!this.events[eventName]) return;

    // 如果不传 callback，则移除所有监听
    if (!callback) {
      delete this.events[eventName];
    } else {
      this.events[eventName] = this.events[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }

  // 触发事件
  emit(eventName, ...args) {
    if (!this.events[eventName]) return;

    this.events[eventName].forEach((callback) => {
      callback(...args);
    });
  }

  // 订阅一次后自动取消订阅
  once(eventName, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(eventName, wrapper); // 调用后立即移除监听
    };
    this.on(eventName, wrapper);
  }
}
```
### 7.实现一个带并发限制的异步调度器 Scheduler，保证同时运行的任务最多有两个。完善下面代码中的 Scheduler 类，使得以下程序能正确输出。
```
class Scheduler {
  add(promiseCreator) { ... }
  // ...
}

const timeout = (time) => new Promise(resolve => {
  setTimeout(resolve, time)
})

const scheduler = new Scheduler()
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')

// 打印顺序是：2 3 1 4
```
实现方法：题目中scheduler.add(() => timeout(time))之后接的是then，说明add方法一定是一个Promise。add方法可以被立即调用，但是不一定会立即执行，说明维护了一个队列，存放我们的任务。
另外，同时运行的任务最多有两个，说明要维护一个变量存放正在运行的任务数量。

```js
class Scheduler {
  constructor() {
    this.queue = []; // 存储等待执行的任务
    this.running = 0; // 当前正在执行的任务数
    this.maxConcurrent = 2; // 最大并发数
  }

  add(promiseCreator) {
    return new Promise((resolve) => {
      this.queue.push(() => promiseCreator().then(resolve));
      this.runNext(); // 尝试运行下一个任务
    });
  }

  runNext() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return; // 超过并发限制或无任务时直接返回
    }

    this.running++; // 增加当前运行的任务数
    const task = this.queue.shift(); // 取出队列中的第一个任务
    task().finally(() => {
      this.running--; // 当前任务完成后减少计数
      this.runNext(); // 继续运行下一个任务
    });
  }
}

// 工具函数，模拟延迟
const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

// 实例化 Scheduler
const scheduler = new Scheduler();

// 添加任务
const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order));
};

// 调用任务
addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
```

## 参考资料

（1）[字节跳动面试之如何用 JS 实现 Ajax 并发请求控制](https://www.jb51.net/article/211898.htm)
（2）[面试官：如何判断两个数组的内容是否相等](https://juejin.cn/post/7290786959441117243)
