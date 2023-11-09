---
title: 移动端开发时的系统兼容性问题
date: 2023-10-27 21:10:36
categories:
  - 踩坑经历
tags:
  - iOS
  - Android
---

吐槽一下移动端开发时碰到的各种意想不到的兼容性问题。

<!-- more -->

## 问题 1: ios 系统输入框 disabled 状态样式过浅

解决方法：增加 -webkit-text-fill-color 属性配置以及要调整 opacity。如下示例：

```css
textarea:disabled {
  color: rgba(255, 255, 255, 1);
  opacity: 1;
  -webkit-text-fill-color: rgba(255, 255, 255, 1);
}
```

## 问题 2:安卓移动端软键盘弹出时底部 fixed 定位被顶上去

原因是安卓系统和 ios 系统加载键盘的方式不同
解决方法：window.onresize 监听页面高度的变化，手动来控制吸底组件的显示和隐藏

```vue
<template>
  <div class="footer" v-show="hideshow"></div>
</template>

<script>
export default {
  data() {
    return {
      docmHeight: "", //第一次获取高度
      nowHeight: "",
      hideshow: true,
      isResize: false,
    };
  },
  watch: {
    // 如果 clientHeight 发生改变，这个函数就会运行
    nowHeight: function () {
      if (this.docmHeight != this.nowHeight) {
        this.hideshow = false;
      } else {
        this.hideshow = true;
      }
    },
  },
  mounted() {
    // 获取浏览器可视区域高度
    this.docmHeight = document.documentElement.clientHeight; // document.body.clientWidth;
    window.onresize = () => {
      // 在窗口或框架被调整大小时触发
      return (() => {
        this.nowHeight = document.documentElement.clientHeight;
        console.log("当前高度", this.nowHeight);
      })();
    };
  },
  methods: {},
};
</script>
```
*个人碎碎念：其实我觉得这个方法并不好，有的手机支持横屏，横屏时页面肯定会触发resize事件，然后底部组件消失了？毕竟mounted生命周期不会再次触发。之前自己想的是键盘弹起事件和input组件聚焦强关联，把隐藏底部组件的触发时机放在聚焦上。但此时遇到较真的产品就会认为页面滚动时应该让input失焦，但浏览器并不会实现这个效果，逻辑的实现又十分复杂。所以最好的解决方案就是换个设计吧。。。*

## 问题3: 针对整个屏幕竖直居中的图片在ios的Safari和Chrome浏览器不居中

原因：书写样式时父元素的高度设置为100vh，也就是屏幕高度，而Safari和Chrome都有工具栏，在工具栏显示的情况下看起来就不怎么竖直居中了。
解决方法：外层父元素高度设置为100%，因为position的设置该元素已经脱离了原本文本流、基准变为视口，高度设置为100%也不会出现撑不起高度的情况，会依照视口高度定值；虽然document.documentElement.clientHeight和window.innerHeight可获取可视高度，但Safari的工具栏是下滑时可隐藏的，所以需要反复监听高度进行调整也比较麻烦
```css
.modal-container {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: #000;
    z-index: 2000;
}
```

## 问题4:小米浏览器夜间模式白色图片发黑

原因：好像是特定的浏览器版本，会在夜间模式对白色图片进行反色
反色原理接近`filter: invert(110%) hue-rotate(180deg)`，但实际操作时按这个方法反色回去发现透明部分也被反色了，所以可能filter的方法还缺少参数
解决方法：一个可能性比较高的解决方法是：
```css
@media (prefers-color-scheme: dark) {
    
    img {
        filter: none!important;
       
    }
}
```
这样可以去除夜间模式的过滤器效果
