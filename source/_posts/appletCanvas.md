---
title: 小程序踩坑经历--canvas层级过高
date: 2022-09-30 16:54:38
categories:
  - 踩坑经历
tags:
  - 小程序
---

小程序开发弹窗功能时遇到的问题。

<!-- more -->

## 需求说明

需要在某一计算结果页设置收集信息弹窗，点击按钮时弹窗悬浮于页面正中；计算结果页包含绘制的饼图

## 存在问题

canvas 属于原生组件，拥有最高层级，页面中其他组件无论设置 z-index 多少都无法覆盖在 canvas 上；且 canvas 标签不能使用`visibility:hidden`或 `opacity: 0;`去隐藏，放在父元素设置同样不可行

## 解决方法

对于只需要展示文字或图片的简单弹窗，可以使用 cover-view 组件，该组件有小程序最高层级。
对于功能相对复杂的弹窗，则需要将 canvas 转为图片。
具体操作内容：

1. 模版部分：
   新增替代 canvas 的图片模块，与 canvas 同级。这里为方便新增的模块和 canvas 同类名以便获取同样的样式大小设置。
   新增变量 imgHide 和 chartImg，分别用于控制 canvas 到图片切换的过程和获取导出图片的临时路径。

```Vue
<template>
    ...
    <canvas
        :hidden="!imgHide"
        class="chart-canvas"
        canvas-id="ringCanvas"
    ></canvas>
    <view class="chart-canvas" :hidden="imgHide">
        <img :src="chartImg"/>
    </view>
    ...
    <view @click="modalShow">tap</view>
    <view class="modal">
        ...
    </view>
</template>

```

2. JS 逻辑部分：
   1）初始化 imgHide 和 chartImg，分别设为 false 和''
   2）增加新方法 canvasToImg，处理 canvas 导出图片的任务。这里 destWidth、destHeight 都设置为原宽高的 2 倍是因为 canvas 是位图，将它渲染到高清屏时,会被放大,每个像素点会用 devicePixelRatio 的平方个物理像素点来渲染,因此图片会变得模糊。使用 2 倍图可以解决问题。绘制成功时将文件路径赋值给 chartImg

```JavaScript
canvasToImg(width, height) {
    setTimeout(() => {
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width,
            height,
            destWidth: width * 2,
            destHeight: height * 2,
            canvasId: 'ringCanvas',
            success: res => {
                const filePath = res.tempFilePath
                console.log('tempFilePath', filePath)
                this.chartImg = filePath
            },
            fail: rej => {
                throw rej
            }
        })
    }, 1000)
}
```

3. 选择 canvas 切 img 的时机。
   如果在拿到导出图片路径时立即切图片，会导致页面的 chart 有一段不自然的闪烁看起来很奇怪；如果不考虑切换操作，直接在图片位置加 loading 图直到拿到导出图片路径，则体感加载时间会很长，因为 loading 时间包括了 canvas 绘制和图片导出，都是比较耗时的操作。
   既然 canvas 换图片的操作是为了解决弹窗被遮挡的问题，那么可以将改变 imgHide 时机放置在点击按钮、弹出弹窗的方法中。
   同时考虑到 canvas 导出图片的时间很长，如果在未完成该操作时弹窗就关闭的话用户就会看到空白的图片，所以需要在弹窗关闭的方法中增加是否需要切回 canvas 的判断。

```JavaScript
modalShow() {
    ...
    this.imgHide = false
}
modalClose() {
    if(this.chartImg != '') {
        this.imgHide = true
    }
}
```

需要注意的点是如果 canvas 的面积大于弹窗的面积，那么当点击弹窗、canvas 尚未导出图片路径时，仍可以透过弹窗的 mask 看到没图的 img 元素的边框。~~（这时最好不要做这个功能了）~~

4. 如果是需要反复绘制的场景，需要注意绘制前 canvas 是否仍然存在，否则 canvas 无法重新绘制，转成图片自然也不执行。

```JavaScript
onShow() {
    ...
    this.imgHide = true
}
```

## 参考文献

（1）[微信小程序 canvas 层级过高，遮住弹窗解决方法](https://wenku.baidu.com/view/9d46b515ba0d6c85ec3a87c24028915f804d842d.html)
