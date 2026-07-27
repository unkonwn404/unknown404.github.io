---
title: h5使用canvas绘制海报
date: 2024-02-05 17:00:26
categories:
  - 备忘录
tags:
  - canvas
---

最近开发 canvas 绘制时发现自己有点忘了绘制规则了，所以贴一下代码做个备份。

<!-- more -->

```js
var bg = "xxx.png";
var qrcode = "xxxx.png";
/**
 * @description: 海报生成函数
 * @param {*} sourceItem 「imgUrl：头图；text（array）；title；」
 * @param {*} rect 海报宽高值
 * @return {*} base64图片
 */
export async function drawPoster(
  sourceItem,
  rect = { width: 375, height: 667 }
) {
  const { imgUrl, text, title, type } = sourceItem;
  const canvas = document.createElement("canvas");
  var dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 绘制背景图
  await drawPic(ctx, dpr, bg);
  // 绘制ai图
  ctx.save();
  drawArcFrame(ctx, 64 * dpr, 64 * dpr, 246 * dpr, 376 * dpr, 16 * dpr);
  await drawPic(
    ctx,
    dpr,
    imgUrl,
    { x: 64 * dpr, y: 64 * dpr },
    { width: 246, height: 376 }
  );
  ctx.restore();
  // 绘制qrcode
  await drawPic(
    ctx,
    dpr,
    qrcode,
    { x: 239 * dpr, y: 369 * dpr },
    { width: 68, height: 68 }
  );
  // 绘制文字
  const lineHeight = 25 * dpr;
  var startY = 467 * dpr + lineHeight,
    startX = 0;
  ctx.textAlign = "center";
  // 预处理，对每行文字进行折行逻辑处理
  let lineCount = 4;
  let row = [];
  ctx.font = `${17 * dpr}px PingFangSC, PingFang SC`; // 设置字体样式和大小
  for (let i = 0; i < text.length; i++) {
    const line = text[i];
    let tempText = "";
    for (let wordIndex = 0; wordIndex < line.length; wordIndex++) {
      if (ctx.measureText(tempText).width < 200 * dpr) {
        tempText += line[wordIndex];
      } else {
        wordIndex--;
        row.push(tempText);
        tempText = "";
      }
    }
    if (tempText) row.push(tempText);
  }
  let totalLineCount = Math.min(row.length, lineCount);
  if (title) {
    startX = canvas.width / 2;
    totalLineCount++;
    startY = 539 * dpr - (lineHeight * totalLineCount) / 2 + lineHeight / 2;
    drawText(
      ctx,
      dpr,
      title,
      { x: startX, y: startY },
      17,
      "normal",
      "#AD2700"
    );
    startY += lineHeight;
    totalLineCount--;
  } else {
    startY = 539 * dpr - (lineHeight * totalLineCount) / 2 + lineHeight / 2;
  }

  for (let i = 0; i < Math.min(row.length, lineCount); i++) {
    startX = canvas.width / 2;
    drawText(ctx, dpr, row[i], { x: startX, y: startY }, 17, "bold", "#AD2700");
    startY += lineHeight;
  }

  const imageURL = canvas.toDataURL("image/png"); // 将Canvas转换为PNG格式的图片URL
  return imageURL;
}

export function drawText(
  ctx,
  dpr = 2,
  text,
  position = { x: 0, y: 0 },
  fontSize = 30,
  fontWeight = "normal",
  color = "red"
) {
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${fontSize * dpr}px PingFangSC, PingFang SC`; // 设置字体样式和大小
  ctx.fillText(text, position.x, position.y); // 设置文字位置和内容
}
export async function drawPic(
  ctx,
  dpr = 2,
  imgUrl,
  position = { x: 0, y: 0 },
  rect = { width: 375, height: 667 }
) {
  return new Promise((resolve) => {
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    image.src = imgUrl;
    image.onload = function () {
      ctx.drawImage(
        image,
        position.x,
        position.y,
        rect.width * dpr,
        rect.height * dpr
      );
      resolve();
    };
  });
}
export function drawArcFrame(ctx, x, y, w, h, r) {
  ctx.beginPath();
  // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
  ctx.fillStyle = "transparent";
  // 左上角
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);

  // border-top
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.lineTo(x + w, y + r);
  // 右上角
  ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);

  // border-right
  ctx.lineTo(x + w, y + h - r);
  ctx.lineTo(x + w - r, y + h);
  // 右下角
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);

  // border-bottom
  ctx.lineTo(x + r, y + h);
  ctx.lineTo(x, y + h - r);
  // 左下角
  ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);

  // border-left
  ctx.lineTo(x, y + r);
  ctx.lineTo(x + r, y);

  // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
  ctx.fill();
  // ctx.stroke()
  ctx.closePath();
  // 剪切
  ctx.clip();
}
```

注意点：

- 绘制图片属于异步操作，只能等图片加载完才能绘制，如果存在显示于图片之上的文字，必须要让文字的绘制在图片回调函数执行之后发生，不能同步执行
- 绘制圆角时，需使用函数 ctx.save()保存之前的绘制内容；圆角的实现本质是对画板进行了剪切、再填充绘制内容实现的，绘制完成后用 ctx.restore()将画板剩余部分恢复
- 文字绘制时起始坐标默认是文字的左下而不是左上
