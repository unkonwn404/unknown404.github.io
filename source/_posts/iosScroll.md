---
title: ios踩坑经历——页面在键盘弹出时上移
date: 2023-09-18 16:16:26
categories:
  - 踩坑经历
tags:
  - iOS
---

## 问题描述

iOS 环境下当 input 组件聚焦、弹出键盘时，页面整体位置上移

## 解决方法

这属于 iOS 系统的特殊操作，必然会出现。解决思路是键盘弹出时记录下当前滚动的位置，用 js 进行位置还原。但考虑执行时可能无法完全抵消 ios 的默认操作，实际展示可能会出现页面上移后迅速回位的奇怪效果，设置为在键盘隐藏时页面回归原位。

## 实现思路

```vue
<template>
  <div class="container">
    <input ref="input" />
    <button @click="focusInput" />
  </div>
</template>
<script>
export default {
  data() {
    return {
      scrollTop: 0,
    };
  },

  mounted() {
    var UA = navigator.userAgent.toLowerCase();
    if (
      UA.indexOf("iphone") > -1 ||
      UA.indexOf("ipad") > -1 ||
      UA.indexOf("ios") > -1
    ) {
      // 监听键盘收起操作
      document.body.addEventListener("focusout", this.pageRecover);
    }
  },
  destroyed() {
    var UA = navigator.userAgent.toLowerCase();
    if (
      UA.indexOf("iphone") > -1 ||
      UA.indexOf("ipad") > -1 ||
      UA.indexOf("ios") > -1
    ) {
      document.body.removeEventListener("focusout", this.pageRecover);
    }
  },
  methods: {
    focusInput() {
      // 触发键盘出现、页面上推
      this.$refs["input"].focus();
      this.scrollTop = window.pageYOffset;
    },
    //软键盘收起的事件处理
    pageRecover() {
      setTimeout(() => {
        window.scrollTo(0, this.scrollTop);
      }, 500);
    },
  },
};
</script>
```

## 参考文献

（1）[由 Vant Field 组件得到解决 IOS 输入框 键盘上推问题](https://juejin.cn/post/6844904083438977032)
