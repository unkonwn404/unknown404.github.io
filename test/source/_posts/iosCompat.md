---
title: 移动端开发时的系统兼容性问题
date: 2023-10-27 21:10:36
categories:
  - 踩坑经历
tags:
  - iOS
  - Android
---

吐槽一下移动端开发时碰到的各种意想不到的兼容性问题。有系统的问题，例如 iOS 和安卓的区别；也有浏览器区别，不同商家的浏览器设计也是差别很大的

<!-- more -->

# 浏览器篇

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

_个人碎碎念：其实我觉得这个方法并不好，有的手机支持横屏，横屏时页面肯定会触发 resize 事件，然后底部组件消失了？毕竟 mounted 生命周期不会再次触发。之前自己想的是键盘弹起事件和 input 组件聚焦强关联，把隐藏底部组件的触发时机放在聚焦上。但此时遇到较真的产品就会认为页面滚动时应该让 input 失焦，但浏览器并不会实现这个效果，逻辑的实现又十分复杂。所以最好的解决方案就是换个设计吧。。。_

## 问题 3: 针对整个屏幕竖直居中的图片在 ios 的 Safari 和 Chrome 浏览器不居中

原因：书写样式时父元素的高度设置为 100vh，也就是屏幕高度，而 Safari 和 Chrome 都有工具栏，在工具栏显示的情况下看起来就不怎么竖直居中了。其实这是 100vh 的一个 bug，可以详见[这篇文章](https://juejin.cn/post/7313979304513552435)
解决方法：外层父元素高度设置为 100%，因为 position 的设置该元素已经脱离了原本文本流、基准变为视口，高度设置为 100%也不会出现撑不起高度的情况，会依照视口高度定值；虽然 document.documentElement.clientHeight 和 window.innerHeight 可获取可视高度，但 Safari 的工具栏是下滑时可隐藏的，所以需要反复监听高度进行调整也比较麻烦

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

## 问题 4:小米浏览器夜间模式白色图片发黑

原因：好像是特定的浏览器版本，会在夜间模式对白色图片进行反色
反色原理接近`filter: invert(110%) hue-rotate(180deg)`，但实际操作时按这个方法反色回去发现透明部分也被反色了，所以可能 filter 的方法还缺少参数
解决方法：一个可能性比较高的解决方法是：

```css
@media (prefers-color-scheme: dark) {
  img {
    filter: none !important;
  }
}
```

这样可以去除夜间模式的过滤器效果

## 问题 5:使用 vue-lazyload 懒加载图片流时，安卓手机会出现某一页面的第一帧图片流呈加载态，只有滚动后才变为有图片的情况

原因：不是很明了，可能与[这篇文章](https://juejin.cn/post/7015142066145460231)说的有关系，iOS 会触发 resize 事件，android 不会。
解决方法：在页面加载或者激活的生命周期加一个滚动函数，滚 1px，触发加载

## 问题 6:粘贴板功能在部分环境失效

原因：粘贴板使用的是 navigator.clipboard，该方法在 iOS 或比较先进的浏览器才会生效，而微信小程序安卓 webview 环境下使用用这个方法会报错
解决方法：增加 navigator.clipboard 的 api 使用检查和设备识别，如果不存在该 api 则使用 npm 包 copy-to-clipboard 的方法

## 问题 7:安卓 qq 浏览器点击图片会自动放大

原因：qq 浏览器的自发行为（就跟他有时候会自动屏蔽 ad-wrap 的元素一样离谱）
解决方法：使用 css 样式 pointer-events: none;可以阻止浏览器默认行为，但是如果希望保留一些浏览器默认行为如长按保存就不能使用该样式

## 问题 8:ios 的 safari 下拉页面时页面外区域是黑的

原因：和 meta 上设置的 theme color 有关
解决方法：document.querySelector('meta[name="theme-color"]').setAttribute('content', bgColor || "#141416")

## 问题 9:ios 部分机型 border-radius 和 overflow：hidden 样式不生效

原因：根据[这篇文章](https://juejin.cn/post/7372396174249459750)应该是因为 ios 手机会在 transform 的时候导致 border-radius 失效
解决方法：1.按照文章的改法、使用动画效果带 transform 的元素的上一级 div 元素的 css 加上语句`-webkit-transform:rotate(0deg);`
；2.将圆角样式加到内容器而不是带 transform 样式的外容器

## 问题 10: iPhone 16 部分条件判断效果与其他机型不一样

原因：不明，网上几乎没有资料，表现上好像是不是很支持链式判断符，有可能会把接收到空数组变成其他？
解决方法：没有什么具体的方法，现在只能根据现象推测可能的问题。例如`extra?.list?.length? true : false`改成`Array.isArray(extra?.list) && extra.list.length > 0? true : false`

## 问题 11: ios 自动高度带滚动的 textarea 在输入需要转行时没有滚动到最新一行；安卓则是完全不会自动滚动到输入的最新行

原因：ios 应该是监听了行数变化进行的滚动，而在中文输入法时存在一个输入到确认的时间，在这个时间内 ios 已经完成了行数监听的滚动；安卓没有这种监听
解决方法：监听输入内容而不是行数变化，设置滚动高度时应该在原本的 scrollHeight 上增加一些行高，以防此时 ios 的滚动高度不包括或低于输入内容高度

```js
watch: {
    inputValue(_new) {
      const target = document.getElementById('textArea');
      console.log(target.scrollHeight, target.clientHeight);
      setTimeout(() => {
        target.scrollTop = target.scrollHeight + 42;
      });
    },
  },
```

## 问题 12:部分模块在 uc 浏览器不显示

**原因**：uc 浏览器内置样式文件，与自定义的样式文件存在覆盖关系。例如如果模块命名为 ad-wrap，则该模块会被强制隐藏。

## 问题 13:使用 em 为单位的模块在 qq 浏览器上比例失效

**原因**：父元素的 font-size 的赋值问题。有的浏览器会存在最小 font-size，小于该阈值则设置无效。qq 浏览器下 font-size 最小 8px，所以父元素的 font-size 的设置不能小于 8px

~~如果不是老项目的旧样式太多太难改了还是尽可能的用 vw 吧~~

## 问题 14:输入框使用@keydown.enter 时回车操作键盘不会隐藏、对展示搜索结果有影响

**原因**：不明
**解决方式**：使用 ref 方法，改为监听 keyup 事件，如果监听到 event.keyCode == 13 进行后续操作，同时在之前的回调函数中增加 this.$refs.searchInput.blur()手动失焦

## 问题 15:手机熄屏后设置的定时器无法生效

原因：根据[这篇文章](https://blog.csdn.net/thirteen_king13/article/details/114077815)，这是系统固有特性
解决方法：监听事件 visibilitychange，锁屏就记录时间，再次显示时记录此时时间，与之前设置的时间间隔比较，超出则立即执行，没有则设置一个新时间间隔的定时器

```js
document.addEventListener("visibilitychange", () => {
  console.log("visibilitychange");
  if (!this.winVisible) return;
  // hidden 为锁屏隐藏状态，visible为重新显示状态
  if (document.visibilityState === "hidden") {
    this.screenShutdownTime = new Date().getTime();
    clearTimeout(showIntroTimer);
  } else if (document.visibilityState === "visible") {
    let screenShowTime = new Date().getTime();
    const diffTime = screenShowTime - this.screenShutdownTime;
    this.countTime = parseInt(this.countTime) - diffTime;
    if (this.countTime > 0) {
      // 重新赋值，间隔后的新的定时器时间
      this.initTimer();
    } else {
      // 已经超出范围，则默认秒数已经读完
      this.countTime = 0;
      this.initTimer();
    }
  }
});
```

# 小程序篇

## 问题 1: 弹窗滚动穿透问题（即弹窗出现时页面还可以做滚动操作）

解决方法：跟使用的技术及小程序平台有关，如果只有[微信小程序](https://developers.weixin.qq.com/community/develop/doc/d615c9a8957a00225ae66b65a8c2bd01?highLine=%25E6%25BB%259A%25E5%258A%25A8%25E7%25A9%25BF%25E9%2580%258F)可以用官方提供的 page-meta，或者在弹窗上增加 catchtouchmove 属性；如果使用了跨端框架（例如[Taro](https://taro-docs.jd.com/docs/vue-overall#taro-3-%E5%9C%A8%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%AB%AF%E7%9A%84%E4%BA%8B%E4%BB%B6%E6%9C%BA%E5%88%B6)），可能这些属性不生效，只能通过改变页面样式如固定高度、溢出隐藏等来禁止页面的滚动
