---
title: cover-view在webview上显示
date: 2023-10-07 11:18:04
categories:
  - 工作技巧
tags:
  - 小程序
---

## 问题描述

根据微信小程序官方文档，webview 覆盖全组件，是不支持其他组件进行覆盖的。但有些需求希望在小程序的 webview 页增加浮动图标、提供引导作用。

## 解决方法

利用 webview 的 bindload 属性或者页面的onShow周期、在 webivew 加载完成后显示 cover-view 的内容，为保证 cover-view 能出现最好加上一点时延。
这只是一个临时解决方法，并不是官方提供的实现。所以在开发者工具上无法看出效果，只有真机才能看到，日后也有无法生效的可能。

## 参考文献
（1）[cover-view能否覆盖webview?](https://developers.weixin.qq.com/community/develop/doc/000a40ddcac42010f5ba0737c56800)
