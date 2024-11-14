---
title: HTML/CSS
date: 2022-06-07 23:42:01
categories:
  - 前端基础
tags:
  - HTML
  - CSS
---

前端 HTML/CSS 方面知识整理。

<!-- more -->

# HTML

## html5.0 新特性

1. 语义化标签
2. 拖拽释放 API
3. 媒体标签
4. 表单控件
5. 数据存储 localStorage、sessionStorage

## html5.0 移除特性

1. 纯表现标签
2. 产生负面影响标签

## 语义化标签特点

1. 对机器友好，有利于 SEO 和读屏软件解析
2. 对开发者友好增加可读性

## HTML 元素

行内元素：多个行内元素可占一行，只能设置 padding、margin 左右
块元素：一个块元素占一行，可设置宽高

## src 和 href 区别

1. 资源类型：src 是资源引用，href 是超文本引用
2. 解析资源方式：浏览器解析 src 资源时会暂停其他资源下载，直至该资源下载执行完毕；href 时浏览器会并行下载资源，不停止文档解析

## script 标签中 defer 和 async 的区别

**defer**：script 下载不会打断 html 解析，在 html 解析完成之后 script 会按顺序执行
**async**：script 下载会打断 html 解析，先加载完先执行

# CSS

## css 新特性

1. 圆角、文字特效、渐变、动画
2. 选择器 eg. last-child
3. 媒体查询
4. 多栏布局
5. flex 布局

## css 选择器

### 选择器优先级

!important > 内联 > id > class > tag > \*

### 伪元素 vs 伪类

伪元素（eg. ::after）：该元素在 dom 树下不存在，仅在 css 下渲染
伪类（eg. :hover）：为已存在的元素设置样式

## css 属性相关

**position 属性**
static：默认
absolute：脱离文档流，相对非 static 父元素
fixed：脱离文档流，相对浏览器窗口
relative：相对原位置定位
sticky：须指定 top、left、right、bottom，跨越特定阈值前是 relative，之后是 fixed
**line-height 属性**
子元素如何继承父元素 line-height 属性？

1. 父元素的 line-height 写了具体数值，比如 30px，则子元素 line-height 继承该值。
2. 父元素的 line-height 写了比例，比如 1.5 或 2，则子元素 line-height 也是继承该比例。
3. 父元素的 line-height 写了百分比，比如 200%，则子元素 line-height 继承的是父元素 font-size \* 200% 计算出来的值。

### animation 和 transition 的区别

- 实现方式：
  transition 是过渡属性，强调过渡，它的实现需要触发一个事件（比如鼠标移动上去，焦点，点击等）才执行动画。
  animation 是动画属性，它的实现不需要触发事件，设定好时间之后可以自己执行，且可以循环一个动画。
- 应用场景：
  transition 用于实现简单的动态效果，例如鼠标悬停在一个元素上时，该元素背景色或透明度的变化。
  animation 用于实现复杂的动态效果，例如元素的旋转、缩放、平移等复杂变换，以及多个动画状态之间的切换。
- 性能：
  transition 在改变文档流的属性时，会引起页面的回流和重绘，对性能影响比较大。
  animation 可以结合 keyframe 设置每一帧，但是 transition 只有两帧。

## css 布局

### flex 布局

**容器属性**

- flex-direction：主轴方向，默认 row
- flex-wrap：换行方式
- flex-flow：flex-direction 属性和 flex-wrap 属性的简写形式
- justify-content：主轴对齐方式
- align-items：交叉轴对齐方式
- align-content：多轴对齐方式

**item 属性**

- order：项目的排列顺序。数值越小，排列越靠前，默认为 0。
- flex-grow：项目的放大比例，默认为 0，即如果存在剩余空间，也不放大。属性都为 1，则它们将等分剩余空间（如果有的话）
- flex-shrink：属性定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小。为 0 时即使空间不足也不缩小
- flex-basis：在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为 auto，即项目的本来大小。
- flex：flex 属性是 flex-grow, flex-shrink 和 flex-basis 的简写，默认值为 0 1 auto。flex 为 1 时对应 3 个值 1 1 0
- align-self：单个项目有与其他项目不一样的对齐方式

### 流式布局

宽高用百分比表示
子元素属性的百分比相对于父元素的宽：width,margin,padding,left,right
子元素属性的百分比相对于父元素的高：height,top,bottom

### 响应式布局

利用媒体查询获取屏幕宽高再设置宽度区间

### 自适应布局

根据分辨率创建多个静态布局

### 弹性布局

以 rem 为单位（rem 相对于根元素`html` font-size，em 相对于父元素 font-size）

### vw 布局

使用 vw、vh 作为单位

## 块级格式化上下文（BFC）

特点：有独立渲染的区域，子元素不会影响到区域外；2 个块元素在区域内垂直分布；计算高度时浮动元素的高度也代入计算；不与浮动元素重叠
触发条件：

1. 根元素
2. overflow 不为 visible
3. display 为 inline-block 或 table、flex
4. position 为 absolute 或 fixed
5. float 不为 none

## 清除浮动

存在问题：父元素未设置高度且子元素浮动时父元素高度会坍塌
解决方法：

1. 父元素加高度
2. 父元素加 float
3. 父元素 overflow：hidden
4. 增加 clear：both 空元素
5. 父元素加伪元素

```
.clearfix{
    zoom:1;
}
.clearfix::after{
    content:'';
    display:block;
    height:0;
    clear:both;
    visibility:hidden;
}
```

## 外部引入 css 方式：link vs @import

1. link 是 html 标签，@import 是 css 属性
2. link 可设置 rel，@import 只能引入 css
3. link 在页面加载时加载，@import 在加载完页面后加载
4. link 无兼容问题，@import 支持 IE5 以上
5. link 支持 js 控制 dom 改样式，@import 不支持

## css 场景应用

### 样式文件内部 px 转 vw

- sass 文件：定义函数，接收参数并且返回计算值
  eg.将 375px 宽度的设计稿转换成适应屏幕宽度的样式

```scss
@function pxToVW($px) {
  @return ($px/375) + vw;
}
// 使用示例
.box {
  width: pxToVW(36);
}
```

- less 文件：

```less
@windowWidth: 100vw;
.rpxToVW(@name,@rpx) {
  //传入不带单位的rpx数值，将rpx转为vw
  @{name}: unit(@rpx / 750 * @windowWidth, vw);
}
.box {
  .rpxToVW(margin,20);
}
```

### 画一个三角形/扇形

思路：div 的宽高设置为 0，border 的宽度设置大一点，除一边外其余边颜色透明；扇形需要有 border-radius

### 宽高自适应的正方形

width：30vw；height：30vw；

### 多行文本溢出

overflow:hidden;
text-overflow:ellipsis;
display:-webkit-box;
-webkit-box-orient:vertical;
-webkit-line-clamp:3;

### 居中方式

#### 水平居中

1）行内元素：text-align：center；
2）块元素：margin：0 auto；
3）position：absolute；left：50%；transform：translateX（-50%）；
4）display：flex；justify-content：center；

#### 垂直居中

1）单行文本：line-height=height
2）display：table-cell；vertical-align：middle；
3）position：absolute；top：50%；transform：translateY（-50%）；
4）display：flex；align-items：center；

#### 水平垂直居中

1）position: absolute; margin：auto；left：0；right：0；top：0；bottom：0；
2）position：absolute；left：50%；top：50%；transform：translate（-50%，-50%）；
3）display：flex；align-items：center；justify-content：center；

### 两栏布局

1）float+margin
2）float+overflow
3）grid-template-columns
4）flex
5）absolute+margin

### 三栏布局

### 双飞翼布局

```
#wrapper{float:left;width:100%;height:50px;}
 #center{margin:0 100px 0 200px;}
 #left{float:left;margin-left:-100%;width:200px;height:50px;}
 #right{float:left;margin-left:-100px;width:100px;height:50px;}
```

### 圣杯布局

```
#parent{height:50px;padding:0 100px 0 200px;}
 #center{float:left;width:100%;height:50px;}
 #left{float:left;margin-left:-100%;width:200px;height:50px;position:relative;left:-200px;}
 #right{float:left;margin-left:-100px;width:100px;height:50px;position:relative;right:100px;}
```
