---
title: 小程序踩坑经历--CDN域名替换
date: 2023-04-15 11:42:17
categories:
  - 踩坑经历
tags:
  - 小程序
---

记录项目迁移时碰到的问题。

<!-- more -->

## 问题 1:关于 CDN 域名替换

### 场景描述

替换了静态资源使用的域名后，是否需要在开发者平台上修改 request 合法域名或 downloadFile 合法域名？

### 解决方式

需要根据代码情况来看：

1. 如果直接在 scss 文件引入 url 链接的情况，不需要进行配置。
2. 使用 wx.downloadFile 相关 API 时需要配置 downloadFile 合法域名列表。需要注意的是使用 wx.getImageInfo 和 wx.loadFontFace 等 API 实际上也会向对应的域名发起请求，如果该域名不在小程序开发者平台的 downloadFile 合法域名列表中，就会出现跨域问题，从而导致请求失败。

## 问题 2:使用的特殊字体文件在 ios 和开发者工具上显示正常，安卓上无法显示

### 场景描述

使用了如下代码来调用 icon 字体文件，域名链接可以正常访问，但会出现上述问题；且远程调试和真机调试平台都没有任何报错信息。

```scss
@font-face {
    font-family: "icon2018";
    src: url("https://statics.xxx.com/iconfont.ttf?t=1539342297740"),
        /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
            url("https://statics.xxx.com/iconfont.svg?t=1539342297740#icon2018")
            format("svg"); /* iOS 4.1- */
}
```

### 解决方式

CDN 的 nginx 配置需要进行跨域处理
## 参考文献
（1）[小程序引用网络字体在安卓无效](https://leiem.cn/2022/01/21/46155/)
