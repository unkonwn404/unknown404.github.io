---
title: 浏览器
date: 2022-05-29 21:04:09
categories:
  - 前端基础
tags:
  - 浏览器
---

## 浏览器存储
|  | cookie | localStorage | sessionStorage | indexDB |
| :----: | :----: | :----: | :----: | :----: |
| 生命周期 | 服务器生成，可没过期时间 | 一直存在 | 会话结束后清理 | 一直存在 |
| 存储大小 | 4KB | 5MB | 5MB | 无限 |
| 服务端通信 | 携带于header中 | 不参与 | 不参与 | 不参与 |
### cookie属性
**value**：保存用户登录态
**httpOnly**：js不可访问
**secure**：只能https携带
**same-site**：不允许跨域
**domain**：哪个域的cookie是有效的

### cookie vs session
1. 存储位置：cookie在浏览器，session在服务器
2. 存储容量：cookie 4KB，session无理论上限
3. 存储内容：cookie只保存ascii字符串，session接受任何字符类型
4. 隐私策略：cookie只能在浏览器查看
5. 有效期：cookie受expires、max-age限制，session受sessionId

### 浏览器垃圾回收机制
1）标记清除：进入环境的变量都标记为进入环境，变量所占内存不得释放；离开环境时标记离开环境
2）引用计数：变量引用时计数+1，取别的值-1，计数为0时释放内存（存在问题：循环引用）

### 浏览器缓存位置
1. **service worker**：浏览器的独立线程，必须https
实现缓存的方式：
1）注册service worker
2）监听install事件，回调中缓存所需文件
3）拦截所有请求事件，查询是否有缓存
2. **memory cache**：会随进程释放而释放
3. **disk cache**
4. **push cache**：上述3种缓存都未命中时使用，只存在于会话中

### 缓存策略
#### 强缓存
1. expires：http1.0产物，格林威治时间
2. cache-control：http1.1产物，max-age单位s
#### 协商缓存
1. Last-Modified/If-Modified-Since
2. ETag/If-None-Matched：适用文件周期查看、内容没变的情况