---
title: 浏览器
date: 2022-05-29 21:04:09
categories:
  - 前端基础
tags:
  - 浏览器
---
浏览器相关知识点。
<!-- more --> 
<!-- toc -->
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

## 浏览器渲染
### 回流 vs 重绘
回流：布局或集合地点属性改变
重绘：节点更改外观、不影响布局

重绘不会引起回流，回流一定会导致重绘

减少回流的方法：
1）transform代替top
2）visibility：hidden代替display：none
3）不用table布局
4）避免css表达式
5）动画选择requestAnimationFrame

### 浏览器从输入URL到返回页面的过程
1）DNS解析网址
2）tcp3次握手建立连接，发送http请求
3）解析html文件转换为dom树
4）解析css生成css dom树
5）dom树和css dom树结合生成render树（过滤掉display：none、head、script等结构）
6）根据render树布局，gpu绘制、合成图层，显示在屏幕
### 浏览器同源策略
协议、域名、端口号一致
### 跨域方法
1）**jsonp**：script（img、link、iframe可跨域）设置script的src为要访问的网址并设置回调函数接收数据。
特点：简单、兼容性好、但只能处理get请求
2）**CORS**：跨域资源共享。服务端设置Access-Control-Allow-Origin
简单请求：
1. 使用get、post、head请求
2. content-type仅限于text/plain,multipart/form-data,application/x-www-form-urlencoded
3. xmlHttpRequestUpload没注册任何事件监听且可使用xmlHttpRequest.upload访问
复杂请求：
会使用option发预检请求、Access-Control—Request-Method告知服务器实际使用的方法，Access-Control-Request-Header告知服务器实际请求所携带自定义首部字段；预检请求完成后发送实际请求
3）**document.domain**：只适用于二级域名相同的情况
4）**location.hash**：通过中间页，不同域之间iframe用location.hash传值，相同域通过js访问
5）**window.name**：跨域数据由iframe的window.name从外域传到本地域，利用window.name在不同页面加载后仍然存在
6）**postMessage**：一个页面发信息，另一个页面监听该事件接收消息
7）**nginx反向代理**：服务器代理目标服务器（eg.百度）将请求传给内部服务器

## 事件处理
### 事件的三个阶段
- 事件捕获
- 处于目标阶段
- 事件冒泡
### 事件委托
利用事件冒泡原理将监听注册在父元素上
优点：1）减少事件注册、减少内存消耗 2）新增对象时不需要加监听事件
### 常见事件
event.preventDefault()：阻止默认事件
event.stopPropagation()：阻止冒泡
event.stopImmediatePropagation()：阻止该节点其他注册事件及冒泡