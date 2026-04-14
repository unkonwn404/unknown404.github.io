# mt

1. 监控系统监听了哪些错误，性能参数
2. sdk 上报了哪些信息
3. 有设计自己的 fmp 计算规则吗
4. 有设计错误率吗
5. 简单 ai 是否用 sse 接口
6. webpack 了解程度
7. cjs 和 es6 区别
8. treeshaking
9. 0.1+0.2 为什么不等于 0.3，怎么处理比较好
10. 寻找链表是否有环

# pg

1. 为什么提到的两个项目技术栈差别那么大
2. 简单 ai 是否实现了 ai 对话
3. 简单 ai 接口格式
4. 简单 ai 迁移时遇到的难点
5. 常见的 react 全局存储，适用场景
6. react 钩子哪些，useCallback、useMemo 区别
7. ts 使用情况，什么情况下使用，什么情况下不考虑使用
8. 场景题：有一个异步任务列表，其中会出现 B、C 任务可能依赖 A 任务，A 任务不需要依赖的场景，并行的任务执行不能超过 5 个，应该如何设计任务执行方式
   （把任务抽象成一个 有向无环图（DAG），每个任务有 id、run 和 deps 三个信息。
   调度时，先找到没有依赖的任务作为入口，放入一个 并发受限的任务池（最大 5 个）。
   当某个任务完成后，减少它的子任务的依赖计数，计数为 0 时说明可执行，就加入候选池。
   整个流程类似 拓扑排序结合并发池，既能保证依赖关系，又能保证最大并发数。）

# bk

1. bi 系统复杂交互怎么实现的
2. umijs 使用有什么好处
3. dva 的特点，和 redux 区别
4. 简单 ai 迁移难点
5. 简单 ai 为什么要做这个迁移
6. 项目的优化有什么？最终效果？
7. 监控系统的介绍，上报了哪些内容
8. 数据上报方式为什么选用了这个？有什么特点？
9. 如果断网是不是上报失败？
10. 比较有成就感的事
11. 工作流怎么搭的？实现了什么
12. n8n 和 dify 的区别？还知道哪些相关应用？
13. 平常关注哪些人？有会将博文上的内容应用吗
14. 知道 mcp？有用过哪些？知道 mcp 怎么调用的吗？

# wyhy

1. 响应式页面怎么实现的
2. 媒体查询 min-width 和 max-width 设置的阈值是包括还是不包括在这个样式里
3. 让一个元素保持 1:1 比例展示有几种方法
4. 跨端框架的难点是什么？怎么解决这些兼容性问题
5. 怎么做的性能优化
6. 图片加载的是什么格式为什么不用 jpg
7. 怎么解决动画效果阻塞渲染的问题
8. 监控系统怎么监听错误的
9. 异步错误 window.addEventListener 能监听到吗
10. 性能指标主要查看的有哪些
11. cls 数据出现异常会是什么原因
12. 算法题：1）找到数组中只出现一次的数；2）零钱兑换
13. pwa 了解多少？缓存什么时候清除
14. ssr 如果有的页面需要权限校验该怎么处理
15. ssr 如果要选定语言该怎么做（没太理解）

# elm

1. 跨端框架原理
2. taro 和 uni-app 的区别？为什么选了 uni-app？有做过 demo 检测性能吗
3. 性能优化做了哪些工作
4. 图片上传的压缩不会对用户造成不好影响吗
5. 有考虑把 http 改成 2 吗
6. 小程序怎么衡量性能的
7. 安卓和 ios 为什么小程序启动加载时间差异那么大？有什么解决的方法
8. 监控系统的难点
9. 告警发送飞书机器人时有没有阻塞问题？
10. 错误上报的数据聚合是怎么做的？
11. 算法题：类背包问题

# dd

### 🧭 一、个人背景与动机

1. 你本科和研究生都是生物工程专业，为什么最后选择做前端？
2. 目前 base 在北京，钉钉岗位在杭州，你对工作地点的考虑是什么？
3. 你的家乡在哪？

### 🤖 二、AI 相关问题

1. 你提到在项目中接触了 AI，有了解目前大模型（如 Claude、GPT、Disco 等）对前端开发的影响吗？你怎么看这种冲击？
2. 你在日常项目中是否大量使用 AI 辅助开发？
3. 如果把整个模块的需求文档和上下文都给 AI，它是否可以完成模块开发？
4. 你了解业界一些 AI Coding 工具吗？（如 Copilot、Trae、Byte、QianWenCode）
5. 你使用的模型主要是哪一个？Claude 是吗？是自己付费的吗？
6. 除了写代码，你日常生活或工作中还用哪些 AI 产品？（比如写周报、绩效）
7. 你了解大语言模型的原理吗？不同模型适合什么场景？
8. 你了解近期 GitHub 上一些 star 较高的 AI 相关开源项目吗？

### 💻 三、项目与技术细节（重点问了两个项目）

#### 1. 简单 AI 项目

- 你在项目中承担什么角色？
- 这个 AI 应用和传统 Web 应用的区别是什么？
- 技术难点是什么？（跨端、异步任务、状态恢复、流式输出等）
- 你提到的流式输出（SSE）有哪些格式规范？
- 输出内容是 Markdown？是否有定制化需求？

#### 2. 前端监控系统

- 这个项目维护多久？你负责的部分是哪些？
- JavaScript 运行时错误怎么捕获？
- Promise 错误怎么捕获？
- 图片或脚本加载失败如何捕获？
- 性能指标有哪些？（LCP、CLS、FID、FP、FCP、LongTask、Navigation Timing、FPS 等）

### ⚙️ 四、性能优化与工程化

1. 你提到在“简单 AI”项目中做了性能优化，具体有哪些措施？
2. 除了包体积优化、预请求，还有其他性能优化手段吗？
3. 如果是 H5 应用（非小程序），性能优化还能从哪些阶段入手？
4. 讲讲一个完整的性能优化思路（从请求到渲染）。
5. 缓存策略有哪些？你们在 H5 中是如何实现缓存的？
6. 讲讲你使用 Vite 的经验，它相对 Webpack 有什么优势？

### 🎨 五、样式与团队协作

1. 大型项目多人协作时，如何防止 CSS 样式冲突？
2. 除了 `scoped` 以外，还有哪些方法？
3. 有没有命名规范（如 BEM）？
4. 什么是重排和重绘？它们的区别？
5. 哪些操作会引发重排？
6. 为什么 `transform` 改变位置不会触发重排？

### ⚛️ 六、React 技术问题

1. 你 React 用得多吗？
2. 有没有封装过自定义 Hook？（举例业务场景）
3. 业界有哪些常见 Hook 库？（ahooks、react-query）
4. 使用 Hooks 需要注意哪些点？（不能放在条件语句/循环中、useMemo/useCallback 慎用等）
5. `useEffect` 和 `useLayoutEffect` 的区别与使用场景？
6. 设计一个自定义 Hook：**监听窗口尺寸变化**，你会怎么实现？
7. `useRef` 的用途是什么？举几个使用场景。

# tt

## 一、基础与项目背景

平时开发移动端多一点还是 PC 端多一点？

你提到做过前端监控系统，这个系统是业务自建的吗？公司内部有没有提供监控基建？

搜狐焦点项目的主站目前访问量大概有多少？

你在焦点项目中提到做过性能优化，可以具体讲讲是怎么做的吗？

这些优化措施是一次性做完的吗？做完之后性能指标有怎样的变化？

你们会统计性能指标吗？例如小程序加载慢，是具体慢在哪？

小程序平台给的性能数据有哪些？

你知道小程序开发者工具可以分析性能指标吗？有用过吗？

有用过小程序的性能相关 API 吗？比如 wx.getPerformance()？

## 二、前端架构与跨端技术

你做过“一码多端”项目，请问是基于 Vue 还是 React？

可以简单介绍一下 Vue 一码多端 的原理吗？（不需要特别详细）

如果在小程序端遇到某些 API 在框架中没有封装，你们是怎么处理的？

## 三、前端监控系统

你能介绍一下前端监控系统主要监控哪些内容吗？分别是如何采集的？

做过白屏监控吗？

你提到白屏与 FP/FCP 有关，可以具体解释一下为什么吗？

如果出现极端情况（比如 DOM 中存在隐藏元素触发 FCP），怎么监控？

## 四、框架原理与演进

你同时做过 Vue 和 React，对吧？那你觉得这两个框架在演进思路上有什么差异？

React 在性能优化层面做过哪些工作？

除了性能优化外，Vue 和 React 在其他方面有哪些不同？

你提到 Vue 正在尝试取消 Virtual DOM，这部分能具体讲讲吗？

📱 五、移动端开发

你们做移动端开发时，分辨率适配有哪些常用方法？

移动端开发有哪些需要注意的问题？

有没有遇到过多倍屏（Retina）相关的适配问题？

这一题我考察的是广度，不是深度——你还可以再想想页面层面有哪些常见适配问题？

## 六、Node.js 与服务端

你有写过 Node.js，对吧？用过哪些框架？

用过 Egg.js 吗？能简单介绍一下它的“洋葱模型”吗？

## 七、代码题（并发控制）

# wp

## 一

1. “你在做这个简单 AI 的移动端是你一个人负责开发的吗？还是多人协作？”
2. “这个项目的开发过程是怎么展开的？为什么要做迁移？”
3. “你能从前端角度讲讲 AI 生图和声文的实现流程吗？”
4. “生成的内容是怎么流式输出、打字机效果是怎么实现的？”
5. “在这个项目中，你觉得最有挑战的地方是什么？”
6. 这个项目的难点
7. “你提到的前端监控系统主要负责哪些部分？”
8. “你在 Sentry 告警上做了什么改进？”
9. “N8N 在你们项目中是怎么用的？”
10. 你做过哪些工程化工作
11. 算法题：对象 key 值展开的逆流程

## 二

1. Taro 跨端框架的原理
2. 小程序底层不能直接操作 dom，运行时怎么实现的虚拟 dom 转真实 dom diff
3. 监控系统负责了哪一部分的工作
4. 性能监控数据量比较大容易触发该怎么解决上报阻塞其他请求的可能
5. 如果出现错误上报时用户刚好要离开页面不是要损失上报
6. 有做过白屏监控吗？性能数据是采样的，白屏不太可能是广泛的情况，用 fp、fcp 不能很好表示白屏
7. 告警系统怎么实现的
8. 整个监控系统的亮点？最有成就感的地方
9. vue 和 react 的发展，两者区别，项目选型
10. string.length 和 array.length 的区别
11. 手写题：输入一个数，返回一个不大于这个数的逐位递增数

# mhy
1. 介绍一个比较有挑战的项目
2. 前端监控系统的工作和设计
3. 流式生文是否会卡顿？怎么处理
4. 100万数据怎么渲染到表格
核心思路是减少同时存在于 DOM 中的节点数量。
通常会采用虚拟表格技术，只渲染可视区域内的行和列；
同时结合服务端分页或懒加载，避免一次性拉取全量数据。
在前端侧还会通过 memo、拆分组件、节流滚动事件来减少不必要的重渲染。
对于列数很多或单元格复杂的场景，还会做列虚拟化和数据预处理。
极端场景下甚至会考虑 Canvas 或 WebGL 实现。
5. 如何去保证代码质量？做过单测吗？有code review吗
6. vue和react区别
7. react router实现原理
8. 带重复数的全排列


# 手写板

## code

```js
function newObject(construct) {
  let obj = {},
    args = [...arguments].slice(1);
  obj._proto_ = construct.prototype;
  let res = construct.apply(obj, args);
  return res ?? obj;
}
function myInstanceOf(left, right) {
  let proto = right.prototype;
  while (true) {
    if (left == null) return false;
    if (left == proto) return true;
    left = left._proto_;
  }
}
function deepClone(obj, hash = new WeakMap()) {
  if (hash.has(obj)) return hash.get(obj);
  let res = Array.isArray(obj) ? [] : {};
  hash.set(obj, res);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object") {
        res[key] = deepClone(obj[key], hash);
      } else {
        res[key] = obj[key];
      }
    }
  }
  return res;
}
// function 克隆利用eval和function的tostring
Function.prototype.myCall = function () {
  let context = arguments[0] || window,
    args = [...arguments].slice(1);
  context.fn = this;
  let res = context.fn(...args);
  delete context.fn;
  return res;
};
Function.prototype.myApply = function () {
  let context = arguments[0] || window,
    args = arguments[1] || [];
  context.fn = this;
  let res = context.fn(...args);
  delete context.fn;
  return res;
};
Function.prototype.myBind = function () {
  let _this = this,
    context = arguments[0] || window,
    args = [...arguments].slice(1);
  return function F() {
    let newArgs = [...arguments].concat(args);
    if (this instanceof F) {
      return new F(...newArgs);
    }
    return _this.apply(context, newArgs);
  };
};
function createObj(obj) {
  function f() {}
  f.prototype = obj;
  return new f();
}
function extendClass(sub, superClass) {
  function f() {}
  f.prototype = superClass.prototype;
  sub.prototype = new f();
  sub.prototype.constructor = sub;
}
function myFlatten(arr) {
  let res = [];
  arr.forEach((item) => {
    if (Array.isArray(item)) {
      res.push(...myFlatten(item));
    } else {
      res.push(item);
    }
  });
  return res;
}
arr.flat(Infinity);
arr
  .toString()
  .split(",")
  .map((item) => +item);
function debounce(fn, delay) {
  let timeout = null;
  return function () {
    const _this = this,
      args = [...arguments];
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(_this, args);
    }, delay);
  };
}
function throttle(fn, delay) {
  let now = new Date().getTime(),
    pre = 0;
  return function () {
    const _this = this,
      args = [...arguments];
    now = new Date().getTime();
    if (now - pre > delay) {
      fn.apply(_this, args);
    }
    pre = now;
  };
}
function throttle(fn,delay){
  let timeout =null
  return function(){
    const _this=this,args=[...arguments]
    if(!timeout){
      timeout=setTimeout(()=>{
        fn.apply(_this,...args)
        clearTimeout(timeout)
      },delay)
    }
  }
}
function compose(...fnArr) {
  if (fnArr.length == 0) return () => {};
  if (fnArr.length == 1) return fnArr[0];
  return fnArr.reduce(
    (pre, cur) =>
      (...args) =>
        pre(cur(...args))
  );
}
Array.from(new Set(arr));
function unique(arr) {
  return arr.filter((item, i) => arr.indexOf(item) == i);
}
function unique(arr) {
  return arr.reduce((pre, cur) => {
    if (!pre.includes(cur)) {
      pre.push(cur);
    }
    return pre;
  }, []);
}
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  let pivot = arr[0],
    left = [],
    right = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat(pivot, quickSort(right));
}
function bubbleSort(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
function scheduler(tasks, limit, times) {
  let running = 0,
    finished = 0,
    final = [];
  return new Promise((resolve) => {
    function next() {
      if (running >= limit) return;
      running++;
      runWithRetry(tasks[running], times)
        .then((res) => {
          final[running] = res;
        })
        .catch((e) => {
          final[running] = e;
        })
        .finally(() => {
          finished++;
          if (finished >= tasks.length) {
            resolve(final);
          } else {
            next();
          }
        });
    }
    while (running < limit) {
      next();
    }
  });
}
function runWithRetry(task, times) {
  let count = 0;
  const timeoutPromise = new Promise((reject) => {
    setTimeout(() => {
      reject();
    }, 3000);
  });

  return new Promise((resolve) => {
    while (count < times) {
      Promise.race([task, timeoutPromise])
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          count++;
        });
    }
    reject();
  });
}
function myPromise(fn) {
  this.callbacks = [];
  this.status = "pending";
  function resolve(res) {
    this.status = "resolved";
    this.callbacks.forEach((func) => func(res));
  }
  function reject(e) {
    this.status = "reject";
    this.callbacks.forEach((func) => func(e));
  }
  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
// myPromise.prototype.then=function(onFullfilled,onRejected){
//     const fullfilled=onFullfilled??(e)=>e
//     const rejected=onRejected??(e)=>e
//     if(this.state='resolved'){
//         fullfilled(this.value)
//     }
//     if(this.state='reject'){
//         rejected(this.value)
//     }
// }
function PromiseAll(promises) {
  if (Array.isArray(promises)) throw new Error("not array");
  let result = [],
    count = 0;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(
        (res) => {
          count++;
          result[i] = res;
          if (count == promises.length) {
            resolve(result);
          }
        },
        (e) => {
          reject(e);
        }
      );
    }
  });
}
function PromiseRace(promises) {
  if (Array.isArray(promises)) throw new Error("not array");

  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promise).then(
        (res) => {
          resolve(res);
        },
        (e) => {
          reject(e);
        }
      );
    }
  });
}
function PromiseSettled(promises) {
  if (Array.isArray(promises)) throw new Error("not array");
  let result = [],
    count = 0;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promise).then(
        (res) => {
          count++;
          result[i] = { status: "resolved", res };
          if (count == promises.length) {
            resolve(result);
          }
        },
        (e) => {
          count++;
          result[i] = { status: "rejected", res: e };
          if (count == promises.length) {
            resolve(result);
          }
        }
      );
    }
  });
}
function Timer() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime((prev) => prev - 1000);
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);
  return { time };
}
function myInterval(fn, delay) {
  const loop = () => {
    fn();
    setTimeout(loop, delay);
  };
  setTimeout(loop, delay);
}
class eventEmitter {
  constructor() {
    this.callbacks = {};
  }
  on(eventName, cb) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    this.callbacks[eventName].push(cb);
  }
  emit(eventName) {
    this.callbacks[eventName].forEach((cb) => cb());
  }
  off(eventName, cb) {
    this.callbacks[eventName] = this.callbacks[eventName].filter(
      (item) => item != cb
    );
  }
  once(eventName, cb) {
    this.on(eventName, () => {
      cb();
      this.off(eventName, cb);
    });
  }
}
function flatObject(obj, parentKey = "", res = {}) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] == "object") {
        flatObject(obj, newKey, res);
      } else {
        res[newKey] = obj[key];
      }
    }
  }
  return res;
}
function mySetTimeout(fn, delay) {
  const cur = +new Date();
  const loop = () => {
    const now = +new Date();
    if (now - cur < delay) {
      requestAnimationFrame(loop);
    } else {
      fn();
    }
  };
  requestAnimationFrame(loop);
}
function mockRequest(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("fetching " + id);
    }, 200);
  });
}
function createAsyncRequest(fn, maxCount) {
  const queue = []; // 等待执行的任务
  let activeCount = 0; // 当前正在执行的任务数

  const next = () => {
    if (queue.length === 0 || activeCount >= maxCount) return;
    const { args, resolve, reject } = queue.shift();
    run(...args).then(resolve, reject);
  };

  const run = async (...args) => {
    activeCount++;
    try {
      const result = await fn(...args);
      return result;
    } finally {
      activeCount--;
      next(); // 任务结束，启动下一个
    }
  };

  return (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject });
      next(); // 尝试启动
    });
  };
}
const runRequest = createAsyncRequest(mockRequest, 5);
for (let i = 0; i < 100; i++) {
  runRequest(i).then(console.log);
}
num.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, "$&,");

function outputTarget(num) {
  let i = 1;
  let numArr = `${num}`.split("").map(Number);
  while (numArr[i] >= numArr[i - 1] && i < numArr.length) {
    i++;
  }
  if (i == numArr.length) {
    return num;
  } else {
    let newNum = numArr
      .map((item, idx) => {
        if (idx < i - 1) {
          return item;
        } else if (idx == i - 1) {
          return item - 1;
        } else {
          return 9;
        }
      })
      .join("");
    return outputTarget(+newNum);
  }
}
console.log(outputTarget(10));
```

https://juejin.cn/post/7451878590507728931

# 开发问题

1. 高复用组件特点
   高复用组件 = 可扩展、可组合、可维护、可配置
   | 目标 | 含义 |
   | -------- | ------------------------------- |
   | **可配置性** | 支持通过 props 动态控制外观和行为 |
   | **可扩展性** | 提供插槽 / render props / 自定义钩子以便拓展 |
   | **可组合性** | 能与其他组件灵活组合，不依赖具体业务逻辑 |
   | **可维护性** | 清晰边界、命名规范、依赖明确、文档完善 |

2. Taro3 跨端原理
   编译时：将 React/Vue 转译成 ast，抽象出组件树和依赖关系，根据目标平台把组件、事件、API 转换为对应平台的实现，同时生成运行时桥接层
   运行时：在各端实现了一套模拟 dom 环境，让 React 语法直接在平台环境运行
3. 小程序 ios 启动性能好于安卓
   ios 与微信共用一套进程，安卓小程序每次启动需要新建进程和基础模块
   安卓 ui 的基础模块新建高于 ios
4. 布局适配方法

移动端的屏幕尺寸和分辨率差异很大，适配的关键是让布局能在不同设备上保持稳定和协调。
常见有几种方式：

rem 方案：通过动态设置 html 的 font-size，让元素尺寸随着 viewport 宽度成比例缩放。
我们一般会结合 postcss-pxtorem 或 amfe-flexible 自动转换。

vw/vh 方案：使用 viewport 相对单位，不依赖 JS，适合全屏布局场景。
我们项目后期用 PostCSS 插件统一把 px 转成 vw。

flex + 百分比布局：组件内部多用 flex，避免写死尺寸。
特别是对列表、卡片类组件，能减少横屏和小屏适配问题。

有时候页面需要横竖屏切换，我们会在 CSS 层加上 @media (orientation: portrait) 做样式微调。

🎨 2. 视觉适配和多倍图问题

不同设备 DPR 不一样，会导致图片模糊或资源过大。
我们主要通过以下方法解决：

使用 2x / 3x 多倍图资源；

或者用 srcset / <picture> 自适应加载；

在小程序中则用 云端裁图（imageView2）接口生成合适分辨率的图；

SVG 图标优先于位图图标。

📱 3. 交互适配

移动端还要关注交互上的适配问题：

不同系统的滚动行为差异（iOS 惯性滚动 / Android 滑动卡顿）；

点击区域过小、按钮易误触；

iOS 的 “安全区域” （刘海屏 / 底部 home bar）；

软键盘弹出时，页面布局被顶上去的问题；

input 焦点引起的页面错位；

触摸事件延迟（以前 300ms 延迟，现在用 touchstart 或 fastclick 可解决）。
