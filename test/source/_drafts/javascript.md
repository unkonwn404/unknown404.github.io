---
title: Javascript基础
excerpt: <p>前端面试常考内容之JavaScript。</p>
categories:
  - 前端基础
  - 前端技术体系
tags:
  - JavaScript
---
compose函数实现
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



限制并发请求数
```
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
## 参考资料
[字节跳动面试之如何用JS实现Ajax并发请求控制](https://www.jb51.net/article/211898.htm)