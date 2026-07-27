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

## 问题 3:同路径页面跳转时，页面 data 没更新

### 场景描述

页面切换大概是这样一个过程 pageA -> pageB?id=1 -> pageB?id=2
当跳 pageB?id=2 时，data 中的一个对象数据还保持为 pageB?id=1 的数据

### 解决方式

目前无法分析具体原因，有可能是 mpvue 的框架问题，但这个问题不是稳定触发的，当跳转事件绑定的是@click.stop 的时候才发生。
当前保守的解决方式是在 onHide 或 onUnload 周期对 data 数据进行重置

## 问题 4:小程序全局变量

### 场景描述

不同小程序框架，全局变量设置的方式有细微的差别

### 解决方式

1. uni-app、mpvue

在 App.vue 中定义 globalData 的相关配置

```
<script>
    export default {
        globalData: {
            text: 'text'
        }
    }
</script>
```

js 中操作 globalData 的方式如下： getApp().globalData.text = 'test'

在应用 onLaunch 时，getApp 对象还未获取，暂时可以使用 this.globalData 获取 globalData。

2. taro

虽然官方文档给出了[react 语法](https://docs.taro.zone/docs/come-from-miniapp#react)的定义方法，然而设置的 taroGlobalData 只能维持初始化的值，而无法被改动。
想要解决这个问题，可以自己维护一个 globalData 对象，定义获取和修改该对象的方法。

```
const globalData = {}
export function setGlobalData (key, val) {
  globalData[key] = val
}
export function getGlobalData (key) {
  return globalData[key]
}
```

## 参考文献

（1）[小程序引用网络字体在安卓无效](https://leiem.cn/2022/01/21/46155/)
（2）[同一路由切换时，上一次的页面数据会保留](https://github.com/meituan-dianping/mpvue/issues/140)
（3）[Taro -- 定义全局变量](https://www.cnblogs.com/juewuzhe/p/11097146.html)
