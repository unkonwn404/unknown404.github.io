---
title: 计算机网络
tags:
  - 计算机网络
excerpt: <p>前端面试常考内容之计算机网络基础。</p>
categories:
  - 前端基础
date: 2022-05-30 21:47:52
---

## 网络模型

### 网络模型一览

<table style="text-align:center;">
    <tr> 
    	<th>OSI模型</th>
      <th>五层模型</th>
    	<th>TCP/IP模型</th>
   </tr>
   <tr> 
      <td>应用层</td>
   		<td rowspan="3">应用层</td>
   		<td rowspan="3">应用层</td>
   </tr>
   <tr> 
      <td>表示层</td>
   </tr>
   <tr> 
      <td>会话层</td>
   </tr>
   <tr> 
      <td>传输层</td>
   		<td>传输层</td>
   		<td>传输层</td>
   </tr>
   <tr> 
      <td>网络层</td>
   		<td>网络层</td>
   		<td>网络层</td>
   </tr>
   <tr> 
      <td>数据链路层</td>
   		<td>数据链路层</td>
   		<td rowspan="2">网络接口层</td>
   </tr>
    <tr> 
      <td>物理层</td>
   		<td>物理层</td>
   </tr>
</table>

### 应用层

功能：为应用进程提供服务。
示例：http、ftp、dns

#### HTTP

特点：无状态、无连接、灵活简单

##### HTTP 版本

**HTTP1.0**:默认短连接；支持 get、post；资源全请求；
**HTTP1.1**:默认长连接（connection 为 keep-alive）；支持 put、options、head；资源可请求部分；请求和响应必包含 host、区分同一主机不同虚拟主机域名
**HTTP2.0**:
1）二进制分帧；
2）多路复用：一个连接里客户端和浏览器可同时发送多个请求，无需按顺序一一对应，依赖于二进制分帧头部信息标记自己属于哪个流；
3）头部压缩；
4）服务器推送；
_（HTTP2.0 存在问题：队头阻塞，出现丢包时整个 TCP 连接等待重传）_
**HTTP3.0**:QUIC，基于 UDP，省去握手时间，可多路复用不会队头阻塞

##### HTTP vs HTTPS

1）安全性：http 明文传送，https 有 SSL 加密
2）费用：https 需要 CA 证书
3）端口号：http 端口号 80，https 端口号 443

##### HTTPS 加密方式

1）客户端预先向服务端发送其支持的加密协议及版本
2）server-client：服务端发送证书和公钥到客户端
3）客户端向证书认证机构确认公钥的真实性
4）client-server：客户端用公钥加密通话公钥给服务端
5）服务端用私钥解密后获得通话公钥
6）使用通话密钥对称加密信息

##### HTTP 报文格式

HTTP 请求报文：请求方法+URI+协议版本+请求首部字段+内容
HTTP 响应报文：协议版本+状态码+响应首部字段+实体

##### 请求方法

post vs get：
1）长度：get 传递大小受 URL 长度限制（来自浏览器），post 可传递更多
2）安全性：get 相对于 post 不安全
3）缓存：浏览器对 get 请求缓存，post 不会
4）幂等性：get 又幂等性，post 没有，post 可能会改写资源
5）回退刷新时：get 无影响、post 会再提交

##### 状态码

**1xx**：信息
100 - continue
**2xx**：成功
200 - OK
204 - no content
**3xx**：重定向
301 - permanently moved
302 - found（不会像 301 一样更新书签）
304 - not modified
**4xx**：客户端错误
400 - bad request
401 - unauthorized
403 - forbidden
404 - not found
**5xx**：服务器错误
500 - internal error
502 - bad gateway

#### DNS

##### DNS 域名解析

1）查看本地 hosts 文件是否有映射
2）本地 DNS 解析缓存是否有 IP 映射
3）查询本地 DNS 服务器
4）设置本地 DNS 服务器查询方式：

- 转发模式：请求层层上传
- 非转发模式：请求直接给根服务器

###### DNS 查询方式

- 迭代查询：根 DNS 返回给本地 DNS 下一个管理域名的 DNS 地址，让本地 DNS 向该 DNS 查询
- 递归查询：DNS 代替主机进行域名查询

### 传输层

功能：为进程提供数据传输服务
示例：udp、tcp

#### TCP

##### TCP 三次握手

1）client-server：发送同步序列号 SYN，请求连接
2）server-client：收到请求，发送确认应答 SYN+ACK
3）client-server：发送确认 ACK，服务端确认后连接建立

##### 三次握手的原因

防止失效的请求连接到达服务器

##### TCP 四次挥手

1）client-server：客户端发送请求释放报文
2）server-client：服务器收到请求，发送确认应答 ACK，客户端不能向服务器发送数据
3）server-client：服务器不需要连接、发送请求释放报文 FIN
4）client-server：发送确认应答 ACK，等待 2MSL（Maximum Segment Lifetime） 释放连接；服务器释放连接

##### 四次挥手原因

服务器收到释放报文的时候还要传数据，不能立即响应

##### TCP 可靠性原因

- 1.超时重传
- 2.确认应答
- 3.流量控制：发送窗由接收窗剩余大小决定，发送端收到应答后会移动窗口
- 4.拥塞机制：
  1）慢开始和拥塞避免：初始窗为 1，每经过一次 RTT 翻倍窗口，至阈值时窗口变化由翻倍变为+1；超时后阈值减半、窗口大小恢复初始
  2）快重传和快恢复：收到 3 个重复确认后立即重传未收到的报文；阈值设为窗口一半，直接拥塞避免算法

##### TCP vs UDP

1）tcp 面向连接，udp 无连接
2）tcp 面向字节流，udp 面向报文
3）tcp 点对点，udp 支持一对一、一对多
4）tcp 首部至少 20 字节、udp 首部 8 字节
5）tcp 可靠交付，udp 不可靠交付

tcp 支持的协议：telnet、ftp、smtp、http
udp 支持的协议：nfs、snmp、dns、tftp

### 网络层

功能：为主机提供数据传输服务
示例：路由、ip

### 数据链层

功能：将网络层的 IP 数据报封装成帧，在链路节点传输数据

### 物理层

功能：确保数据在物理媒介上传输

## 网络安全

### xss 跨站脚本攻击

将可执行代码注入到网页中
分类：
1）存储型：作用于数据库
2）反射型：作用于 URL
3）DOM 型：作用于 js
解决方法：
1）转义字符
2）设置 content-security-policy
3）cookie 设置 httpOnly

### CSRF 跨站请求伪造

诱导用户跳转到三方网站获取到用户跳转前网站的登录态，冒充用户来攻击网站
解决方法：
1）token、验证码验证
2）cookie 的 same-site
3）referer 检查

**同源策略可以预防 csrf 吗？**

同源策略可以预防 csrf，但通过跨域方法可以绕过同源策略的限制

### 点击劫持

设置透明按钮诱导用户点击
解决方法：
1）js 防御：监听到 iframe 点击后将跳转页置空
2）设置 X-FRAME-OPTIONS

### DDos 分布式拒绝服务

伪造大量 IP 发送请求
解决方法：
1）限制单 IP 请求次数
2）缩短超时时间

### 中间人攻击

中间人截取服务端公钥，伪造证书、密钥给服务器
解决方法：
1）增加安全信道

## CDN 内容分发网络

定义：将缓存服务器分布到用户访问集中到地区或网络中，用户访问网站时将访问指向最近的缓存服务器 ip
A：dns 解析记录里原 ip 映射结果
cname：cdn 服务商地址
cdn 回源：缓存服务器没有符合请求的资源时会回到源服务器请求资源
