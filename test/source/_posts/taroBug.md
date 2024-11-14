---
title: Taro项目开发中的问题总结
date: 2024-08-22 17:51:18
categories:
  - 踩坑经历
tags:
  - Taro
---

最近领导迷恋上了跨端开发，把以前的一个项目迁移成 Taro 了。中间踩了不少奇奇怪怪的坑，终于忍不住列出来吐槽了。

<!-- more -->

## 1. 样式设置为 scoped 无法生效

这好像没什么解决方法，自己写 scss 的时候小心点吧

## 2. Taro.redirectTo({ url: "/pages/404/index" });小程序跳转正常，h5 端报 page /wap/error notfound

原因：配置文件里配置了 customRoutes: { '/pages/404/index': '/error' }
解决方法：去除 customRoutes 配置，h5 的这个配置好像只是改了个 path 名字，并不能做为 route 使用。

## 3. 百度小程序 :first-child 的样式写法失效

原因：编译百度小程序的时候子元素外面都套了一层 dom，所以 first-child 对不上了
解决方法：改用 :first-of-type 或者在 template 代码加 class 判断条件

## 4. H5 下，button 在 active 状态下有默认的白色背景

设置 `&:active { background: none; }` 关掉背景色

## 5. mixins、extends 在 onShow、onHide 周期代码无法生效

原因：页面已经书写了 onShow 和 onHide 的代码，Taro 的代码扩展效果只限于 Vue 的几个生命周期
解决方法：手动在页面 onShow 和 onHide 添加目标逻辑

## 6. eventCenter 监听 onShow 事件在 iOS 失效

原因：官方提供的监听示例代码为：

```js
import { eventCenter, getCurrentInstance } from "@tarojs/taro";

export default {
  mounted() {
    eventCenter.on(getCurrentInstance().router.onShow, () => {
      console.log("onShow");
    });
  },
};
```

实际 iOS 的 router 实例里没有 onShow，就算手动构造也仍然会在 iOS 部分页面监听失效

## 7. 抖音小程序 Button 唤起客服操作不生效

原因：button 组件缺失 im 客服涉及的属性
解决方法：参考[这个 issue](https://github.com/NervJS/taro/issues/14118)，使用插件@tarojs/plugin-inject 这个插件，并在 config 文件里添加这个配置

```js
plugins: [
  [
    "@tarojs/plugin-inject",
    {
      components: {
        // 给button组件添加自定义事件
        Button: {
          "data-im-id": "",
          dataImId: "",
          dataImType: "", // im卡片类型
          "data-im-type": "",
          dataGoodsId: "", // 商品id
          "data-goods-id": "",
          dataBizLine: "", // 类型
          "data-biz-line": "", // 类型
          dataOrderId: "", // 订单id
          "data-order-id": "",
          bindim: "'eh'", // 监听跳转IM的成功回调
          bindIm: "'eh'", // 监听跳转IM的成功回调
          binderror: "'eh'", // 监听跳转IM的失败回调
          bindError: "'eh", // 监听跳转IM的失败回调
        },
      },
    },
  ],
];
```

使用 Vue 组件书写时格式如下：

```vue
<button
  open-type="im"
  dataImId="123456"
  :onIm="imCallback"
  :onError="onimError"
>
联系客服
</button>
```

## 8. h5 页面跳转使用 navigateTo、redirectTo 会失败

原因：跳转目标带参数且用 customRoute 改写过路径
解决方法：？？？基本没有，当时官方说后续版本修复，但实际如果使用这些 API 跳转在 wap 上的效果是创建了一个页面而不是像 spa 的跳转，也就是说如果连续点击跳转、就会创建好几个相同的页面

## 9. 配置打包环境变量后运行代码报错

原因：环境变量名只设置了双引号，而实际运行时 Taro 会对变量名做解析，所以需要写成如下格式：

```js
module.exports = {
  // ...
  env: {
    NODE_ENV: '"development"', // JSON.stringify('development')
    TARO_APP_VERSION: JSON.stringify(`${process.env.TARO_ENV}_${getTimeTag()}`),
  },
};
```

这个其实在[说明文档](https://docs.taro.zone/docs/next/config-detail#env)里有反映出来，但这不合常规的设置居然一点解释都没有，差评。。。
