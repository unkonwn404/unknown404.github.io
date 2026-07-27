---
title: 关于登录拦截和history.back()的二三事
date: 2022-03-31 10:13:02
categories:
  - 踩坑经历
tags:
  - 浏览器
  - WEB API
---
记录一个维护老项目时发现的古早bug。
<!-- more --> 
## 问题描述

WAP项目首页通常有一个用户中心的图标供用户进入自己个人页面。当点击这个用户中心图标时后端会根据请求是否包含登录态来绝对是否重定向请求。例如说目标连接是user.domain.com，在这个域名下的代码由于没有拿到用户个人信息进行了302重定向，重定向后的连接为login.domain.com?to=user.domain.com。但如果user.domain.com的代码找到了用户数据就会渲染前端页面。
{% image center clear login.jpg  "登录逻辑"%}

目前为止看起来是不是毫无问题？

但如果重定向页面login.domain.com?to=user.domain.com有回退按钮呢？前端回退通常使用的方法是history.back()，可以返回上一级页面，此时回退的话就会就会退回user.domain.com，该域名下的代码会再次执行判断登录态的逻辑，发现没有登录态依然会继续重定向，因此实际的页面效果看起来就像登录页面刷新，无法回退到首页。而到了Safari浏览器，由于该移动端浏览器不会重新执行返回的页面的代码，所以浏览器的url停留在user.domain.com，且没有渲染页面，看起来就像白屏故障一样。
{% image center clear login-problem.jpg  "登录页回退逻辑"%}


## 解决方式？

（1）后端的登录跳转逻辑调整（~~具体怎么改是后端的事跟我有什么关系呢~~ ）

（2）前端用户中心跳转的链接随获取用户登录态接口的数据而调整

## 参考文献
[javascript解决在safari浏览器中使用history.back()返回上一页后页面不会刷新的问题](http://t.zoukankan.com/yanggb-p-11675315.html)
