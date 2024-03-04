---
title: 小程序海报绘制
date: 2022-03-28 20:33:20
excerpt: <p>记录下自己在实现海报绘制时遇到的问题及解决的方案。</p>
categories:
  - 技术学习
tags:
  - 小程序
  - canvas
---


## 背景

小程序海报绘制目前主要的实现方法有两种：

1. 前端使用 canvas 绘图并生成
2. 后端使用后端绘图库进行绘制，返回给小程序端

第一种方法的主要问题是 canvas 和纯 html 布局相去甚远，不同设备、不同版本的情况下绘图效果不可预期。但第二种方法开发难度也不小，且服务器压力会增大，后端未必愿意接受。所以压力又来到了前端。。。
尽管目前前端已经有一些生成海报的插件，如[painter](https://github.com/Kujiale-Mobile/Painter)，可以以 json 的格式将元素的定位及样式传给画板。但如果需求出现了较为个性化的要求，例如根据内容海报高度自适应、一行开头不可以有标点等，还是自己手写原生比较好。
由于开发使用的是 Taro 框架所以关于 API 的介绍使用也主要以 Taro 为主。

## 准备工作

### 单位换算

canvas 绘制使用的是 px 单位，但不同设备的 px 是需要换算的，所以在组件中统一使用 rpx 单位，这里就涉及到单位怎么换算问题。
小程序默认屏幕宽度为 750rpx，通过 wx.getSystemInfoSync 获取设备屏幕尺寸宽度，就可以获得实际 px 单位与 rpx 之间的比例，以此做单位转换。

```JavaScript
export function rpx2px(distance) {
    let result = 0
    if (!isNaN(distance)) {
        result = wx.getSystemInfoSync().windowWidth * distance / 750
    }
    return result
}

export function px2rpx(distance) {
    let result = 0;
    if (!isNaN(distance)) {
        result = distance * 750 / wx.getSystemInfoSync().windowWidth;
    }
    return result;
}

```

### canvas 隐藏

在绘制海报过程时，因为不想让用户看到 canvas，所以我们必须把 canvas 隐藏起来。实现方法为控制 canvas 的绝对定位，将其移出可视界面。

```css
.poster-canvas {
  position: fixed;
  top: -10000rpx;
}
```
## canvas初始化
canvas的初始化操作本身并不难，在模版中添加一个canvas组件并命名，在点击生成海报按钮时拿到canvas实例并设置宽高。
```
const ctx = Taro.createCanvasContext('poster-canvas')
const { width, height } = this.state
// 底版
ctx.width = width
ctx.height = height
```
如果海报宽高固定，直接赋值即可。但如果希望完成海报高度随文字内容自适应变化的需求时，则需要多一步操作：可以先在渲染阶段制造一个DOM结构，将该DOM按照设计稿的需求绘制文字、外框间距等内容，在点击生成海报时利用createSelectorQuery获取海报中可变DOM元素(如海报正文DOM）的宽高，以及海报最外层DOM的宽高。注意该方法获取到的结果单位是px。
```
Taro.nextTick(() => {
    const query = Taro.createSelectorQuery()
    query.select('.key-box').boundingClientRect()
    query.exec(res => {
        try {
            const height = px2rpx(res[0].height)
            const width = px2rpx(res[0].width)
            this.setState({ width, height })
            this.drawPosterCanvas()//绘制canvas
        } catch (e) {
            this.failCb()//错误处理

        }
    })

})
```
使用Taro框架时需注意查询DOM属于异步内容无法立即获取只能利用nextTick函数等待下一个时间片获取，获取到以后存储到state里便于绘图时取出。这里需要注意即使将查询内容放在nextTick里，也有少数未查到DOM结果的情况，需要进行错误处理。
## 图形篇

### 绘制图片

由于小程序打包的大小有限制，因此图片建议使用 CDN 保存。在绘制图片前需要对远程的图片进行下载的操作。

```JavaScript
downloadSharePic = (url) => {
    return new Promise((resolve, reject) => {
        Taro.downloadFile({
            url,
            success(res) {
                if (res.statusCode === 200) {
                    resolve(res.tempFilePath)
                } else {
                    reject(res)
                }
            },
            fail(err) {
                reject(err)
            }
        })
    })

}
```

下载成功后会获得一个临时文件路径，就可以调用 drawImage 函数来绘制了。注意点：下载图片属于异步操作，需要在等待返回值以后才可以绘制。
ctx.drawImage 有 3 种写法：

- drawImage(imageResource, dx, dy)
- drawImage(imageResource, dx, dy, dWidth, dHeight)
- drawImage(imageResource, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) 从 1.9.0 起支持
  如果无法使用第三种方案、需要自己调整图片宽高按设计比例显示在 canvas 上的话，可以采用如下函数：

```JavaScript
getDrawImgParams = (src,defaultWidth,defaultHeight) => {
    return new Promise((resolve, reject) => {
        Taro.getImageInfo({
            src,
            success: (res) => {
                const { width, height } = res
                let sx = 0
                let sy = 0
                let sWidth = width
                let sHeight = height
                const w2h = width / height
                const defaultW2H = defaultWidth / defaultHeight
                if (w2h > defaultW2H) { // 更宽
                    sWidth = Math.floor(height * defaultW2H)
                    sx = Math.floor((width - sWidth) / 2)
                } else if (w2h < defaultW2H) { // 更高
                    sHeight = Math.floor(width / defaultW2H)
                    sy = Math.floor((height - sHeight) / 2)
                }
                resolve({
                    sx,
                    sWidth,
                    sy,
                    sHeight
                })
            },
            fail: rej => {
                reject(rej)
            }
        })
    })

}
```

### 绘制圆形

需要用到的函数是 canvasContext.arc，作用是绘制一条曲线。

```
canvasContext.arc(x: number, y: number, r: number, sAngle: number, eAngle: number, counterclockwise?: boolean)
```

x、y 对应圆心坐标，sAngle 是起始弧度，eAngle 是终止弧度。创建一个圆可以指定起始弧度为 0，终止弧度为 2 \* Math.PI。
如果是画线框就使用 ctx.stroke();如果是画色块就使用 ctx.fill()。

### 绘制圆角矩形

canvas 并没有提供绘制圆角矩形的方法，因此我们需要以另一种方法来实现它。方法的核心是将圆角矩形拆解成四个直角圆弧和四条直线连接的图形。具体的实现如下面的代码所示。圆弧的绘制除了上面提到的arc之外，还有一个叫 CanvasContext.arcTo 的方法，其特点是控制点和半径绘制圆弧路径。

```JavaScript
drawArcFrame = (ctx, x, y, r, w, h) => {
    ctx.beginPath()
    ctx.fillStyle = 'transparent';
    // 左上角
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // border-top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.lineTo(x + w, y + r)
    // 右上角
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // border-right
    ctx.lineTo(x + w, y + h - r)
    ctx.lineTo(x + w - r, y + h)
    // 右下角
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // border-bottom
    ctx.lineTo(x + r, y + h)
    ctx.lineTo(x, y + h - r)
    // 左下角
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // border-left
    ctx.lineTo(x, y + r)
    ctx.lineTo(x + r, y)

    // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
    ctx.fill()
    // ctx.stroke()
    ctx.closePath()
}
```

如果是绘制图片的外框，我们通常需要对原图进行剪切获得我们需要的样式。在我们调用 CanvasContext.clip()进行剪切时，之后的绘图都会被限制在被剪切的区域内（不能访问画布上的其他区域）。因此在使用 clip 方法前通过使用 save 方法对当前画布区域进行保存，在裁剪完图片后通过 restore 方法对其进行恢复。

```JavaScript
ctx.save()// 1)保存画布区域
this.drawArcFrame(ctx, 0, 0, 12, width, height)//2)绘制圆角
ctx.clip()//3）裁剪画板
ctx.setFillStyle('#F8F9FB')
ctx.fillRect(0, 0, width, height)//4）在剪切后的画板绘图
ctx.restore()//5）恢复画板区域
```

### 绘制阴影

微信小程序本体从基础库 1.9.90 开始支持设置。

```
// 阴影的x偏移
ctx.shadowOffsetX = 10;
// 阴影的y偏移
ctx.shadowOffsetY = 10;
// 阴影颜色
ctx.shadowColor = 'rgba(0,0,0,0.5)';
// 阴影的模糊半径
ctx.shadowBlur = 10;
// 绘制图形
ctx.fillStyle = 'rgba(255,0,0,0.5)'
ctx.fillRect(100, 100, 100, 100);
```

阴影的设置一定要在图形绘制前。
### 圆形内阴影和圆角矩形内阴影
大致思路：先绘制边框和阴影，再用clip把外阴影裁掉。

## 文字篇

### 文字样式

Taro 框架支持的关于字体的方法只有 setFontSize，用于修改字体大小。
但微信小程序本体从基础库 1.9.90 开始支持设置字体样式 canvasContext.font。涉及到的参数如下所示：
|属性|说明|
| :----: | :----: |
|style| 字体样式。仅支持 italic, oblique, normal|
|weight| 字体粗细。仅支持 normal, bold|
|size| 字体大小|
|family| 字体族名。注意确认各平台所支持的字体|

示例：

```
ctx.font = 'normal bold 40px sans-serif';
```

关于字体粗细的问题据说安卓手机只 400 和 700 的 font-weight，如果设置其他的权重也无法实现效果。需要注意点是如果设置了加粗属性 bold，那么在后续文字书写中 weight 的属性值必须设置为 400 而不是 normal，否则在安卓机上后续绘制的文字仍然加粗，尽管开发者工具上正常。

### 单行文字

需要用到的函数是 canvasContext.fillText。

```
canvasContext.fillText(text: string, x: number, y: number, maxWidth?: number)
```

x、y 对应文字左上角坐标。
需要注意的点是绘制文字前需要使用 setTextBaseline 函数确定文字竖直方向对齐方式，不设置的话似乎默认是 normal，而不同系统设备上各个基准都不太一样，绘制的效果可能达不到预期。通常设置 top 即可满足需求，如果设置了 middle 则 y 值应该为文字左上的 y 坐标+fontSize/2。

### 多行文字

canvas 绘制文字时，只会一股脑的在单行上一直画下去而不会根据容器宽度自动换行。如果希望进行折行、分段，则可以使用 CanvasContext.measureText(string text)的方法，具体步骤包括：
- 1）准备工作：去除文本里面和空格相关的字符，保留的话可能在安卓机上出现绘制异常
- 2）用tempText变量存储单行字段，逐字遍历文本，用measureText测截至当前字符的文段长度是否超过限定宽度，没有则将当前字符添加到tempText；注意设置阈值时要减去一个字宽，防止遍历到接近折行的位置已经存储的字段tempText已经接近于限制宽度、此时再加一个字符超过设计宽度的情况。
- 3）measureText测截至当前字符的文段长度超过限定宽度时将该字段推入数组中保存；同时清空tempText，用于下一行文字的测算。
- 4）循环结束后不要忘记将最后一行的结果推入数组row中
- 5）遍历行数组row，每行用fillText完成
- 6）如果考虑行数限制，可以在遍历row时增加判断条件，在绘制到最后一行时将最后一个字替换为省略号

```JavaScript
processWord = (ctx, text, width,fontSize,lineHeight,maxLine) => {
    text=text.replace(/\s*/g,"");
    let row = []
    let tempText = ''
    for (let wordIndex = 0; wordIndex < text.length; wordIndex++) {
        if (ctx.measureText(tempText).width < width - fontSize) {
            tempText += text[wordIndex]
        } else {
            // 折行位置
            wordIndex--
            row.push(tempText)
            tempText = ''
        }
    }
    row.push(tempText)
    for (let rowNum = 0; rowNum < row.length&&rowNum<maxLine; rowNum++) {
        let text = row[rowNum]
        if (row.length > maxLine && rowNum == maxLine-1) {
            text = text.substring(0, text.length - 1) + '...'
        }
        ctx.setTextBaseline('top')
        ctx.fillText(text, 70, 258 + rowNum * lineHeight)
    }
}
```
#### 附加要求：标点不可以出现在首行
在上述算法的基础上在折行处增加while判断，如果字符是标点就加在当前行tempText，一直到下一个是汉字
```JavaScript
for (let wordIndex = 0; wordIndex < text.length; wordIndex++) {
    if (ctx.measureText(tempText).width < width - fontSize) {
        tempText += text[wordIndex]
    } else {
        // 折行位置
        while (/[，。”！？、：）》；]/.test(text[wordIndex])) {
            tempText += text[wordIndex++]
        }
        wordIndex--
        row.push(tempText)
        tempText = ''
    }
}
```

## 绘制展示
### canvas转image
绘制完成后需要调用Taro.canvasToTempFilePath将canvas转为图片输出，需要注意的点包括：1）Taro.canvasToTempFilePath需要写在ctx.draw的回调中；2）draw的回调函数是异步的，canvasToTempFilePath需要在setTimeout中做一些延时，一般1s就可以了。
生成的临时url传入Image组件中就可以在屏幕中显示了。

### 海报预览使用 scroll-view 展示时，该组件没有显示 css 样式的圆角

解决方法：在 scroll-view 元素上添加以下样式：

```
overflow: hidden;
transform: translateY(0);
border-radius: 16rpx;
```
当海报的高度没有超过设计稿的可视高度时，scroll-view作为套在海报外层的组件也不应该有滚动条。可以在海报生成组件的state里再维护一个isScroll的变量，判断和赋值的位置可以在[canvas初始化](#canvas初始化)执行。
## 参考文献
1. [在Canvas中实现矩形、圆形、圆角矩形内阴影效果](http://www.yanghuiqing.com/web/350)  
2. [手把手教你用canvas绘制小程序海报（一）](https://juejin.cn/post/6983574104167170061)  
3. [轻松生成小程序分享海报](https://juejin.cn/post/6844903663840788493#heading-0)  
4. [微信小程序《海报生成》](https://juejin.cn/post/7039199842421178382#heading-1)  
