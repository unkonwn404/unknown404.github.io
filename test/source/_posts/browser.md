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

|            |          cookie          | localStorage | sessionStorage | indexDB  |
| :--------: | :----------------------: | :----------: | :------------: | :------: |
|  生命周期  | 服务器生成，可没过期时间 |   一直存在   | 会话结束后清理 | 一直存在 |
|  存储大小  |           4KB            |     5MB      |      5MB       |   无限   |
| 服务端通信 |     携带于 header 中     |    不参与    |     不参与     |  不参与  |

### cookie 属性

**value**：保存用户登录态
**httpOnly**：js 不可访问
**secure**：只能 https 携带
**same-site**：是否允许跨站携带
**domain**：哪个域的 cookie 是有效的

#### 辨析：跨域（cross origin）和跨站（cross site）的区别

同源是指两个 URL 的协议/主机名/端口一致。
同站只要两个 URL 的 eTLD+1 相同即可，不需要考虑协议和端口。其中，eTLD 表示有效顶级域名，注册于 Mozilla 维护的公共后缀列表（Public Suffix List）中，例如，`.com`、`.co.uk`、`.github.io` 等。eTLD+1 则表示，有效顶级域名+二级域名，例如 `taobao.com `等。

### cookie vs session

1. 存储位置：cookie 在浏览器，session 在服务器
2. 存储容量：cookie 4KB，session 无理论上限
3. 存储内容：cookie 只保存 ascii 字符串，session 接受任何字符类型
4. 隐私策略：cookie 只能在浏览器查看
5. 有效期：cookie 受 expires、max-age 限制，session 受 sessionId

### 浏览器垃圾回收机制

1）标记清除：进入环境的变量都标记为进入环境，变量所占内存不得释放；离开环境时标记离开环境
2）引用计数：变量引用时计数+1，取别的值-1，计数为 0 时释放内存（存在问题：循环引用）

### 浏览器缓存位置

1. **service worker**：浏览器的独立线程，必须 https
   实现缓存的方式：
   1）注册 service worker
   2）监听 install 事件，回调中缓存所需文件
   3）拦截所有请求事件，查询是否有缓存
2. **memory cache**：会随进程释放而释放
3. **disk cache**
4. **push cache**：上述 3 种缓存都未命中时使用，只存在于会话中

### 缓存策略

#### 强缓存

1. expires：http1.0 产物，格林威治时间
2. cache-control：http1.1 产物，max-age 单位 s

#### 协商缓存

1. Last-Modified/If-Modified-Since
2. ETag/If-None-Matched：适用文件周期查看、内容没变的情况

#### 刷新操作对缓存内容影响

正常操作（地址栏输入 url，跳转链接，前进后退等）：强制缓存有效，协商缓存有效。
手动刷新（f5，点击刷新按钮，右键菜单刷新）：强制缓存失效，协商缓存有效。
强制刷新（ctrl + f5，shift+command+r）：强制缓存失效，协商缓存失效。

## 浏览器渲染

### 回流 vs 重绘

回流：布局或集合地点属性改变
重绘：节点更改外观、不影响布局

重绘不会引起回流，回流一定会导致重绘

减少回流的方法：
1）transform 代替 top
2）visibility：hidden 代替 display：none
3）不用 table 布局
4）避免 css 表达式
5）动画选择 requestAnimationFrame

### 浏览器从输入 URL 到返回页面的过程

1）DNS 解析网址
2）tcp3 次握手建立连接，发送 http 请求
3）解析 html 文件转换为 dom 树
4）解析 css 生成 css dom 树
5）dom 树和 css dom 树结合生成 render 树（过滤掉 display：none、head、script 等结构）
6）根据 render 树布局，gpu 绘制、合成图层，显示在屏幕

### 浏览器同源策略

协议、域名、端口号一致

### 跨域方法

1）**jsonp**：script（img、link、iframe 可跨域）设置 script 的 src 为要访问的网址并设置回调函数接收数据。
特点：简单、兼容性好、但只能处理 get 请求

```
function jsonp(url,callback,success){
  var script=document.createElement('script')
  script.src=url
  script.async=true
  script.type='text/javascript'
  window[callback]=function(data){
    success&&success(data)
  }
  document.body.append(script)
}
```

2）**CORS**：跨域资源共享。服务端设置 Access-Control-Allow-Origin
简单请求：

1. 使用 get、post、head 请求
2. content-type 仅限于 text/plain,multipart/form-data,application/x-www-form-urlencoded
3. xmlHttpRequestUpload 没注册任何事件监听且可使用 xmlHttpRequest.upload 访问
   复杂请求：
   会使用 option 发预检请求、Access-Control—Request-Method 告知服务器实际使用的方法，Access-Control-Request-Header 告知服务器实际请求所携带自定义首部字段；预检请求完成后发送实际请求

3）**document.domain**：只适用于二级域名相同的情况
4）**location.hash**：通过中间页，不同域之间 iframe 用 location.hash 传值，相同域通过 js 访问
5）**window.name**：跨域数据由 iframe 的 window.name 从外域传到本地域，利用 window.name 在不同页面加载后仍然存在
6）**postMessage**：一个页面发信息，另一个页面监听该事件接收消息
7）**nginx 反向代理**：服务器代理目标服务器（eg.百度）将请求传给内部服务器

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
