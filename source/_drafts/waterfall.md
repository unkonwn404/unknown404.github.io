---
title: 瀑布流的实现及注意点
categories:
  - 技术学习
tags:
  - JavaScript
---

最近的开发需求中有瀑布流的开发，趁此机会了解一下瀑布流的实现方式。

<!-- more -->

根据网上的资料，瀑布流的实现主要可以分为 css 实现和 js 实现
为方便比较，这里简单实现了一个图片数据加载的代码。

```vue
<template>
  <view class="content">
    <view class="waterfall-container">
      <view
        class="img-container"
        v-for="(item, idx) in imgList"
        :key="idx"
        :style="{ width: `${colWidth}rpx` }"
      >
        <image
          :src="item.src"
          :style="{ height: `${item.height}rpx` }"
          v-if="item.height"
        ></image>
        <view class="txt">{{ item.title }}</view>
      </view>
    </view>
  </view>
</template>
<script>
import { rpx2px, throttle } from "@/utils/constants";
const windowHeight = uni.getSystemInfoSync().windowHeight;
export default {
  data() {
    return {
      title: "Hello index",
      pageNo: 0,
      imgList: [],
    };
  },
  onLoad() {
    this.renderImgList();
  },
  onPageScroll(e) {
    const throttleScrollHandler = throttle(() => {
      this.handleScroll(e.scrollTop);
    }, 300);
    throttleScrollHandler();
  },
  computed: {
    colWidth() {
      return (750 - 20) / 2;
    },
  },
  methods: {
    getImgList(pageNo = 0, pageSize = 10) {
      let data = [];
      for (let i = 0; i < pageSize; i++) {
        let item;
        if (i % 3 == 0) {
          item = {
            src: "http://p9.itc.cn/q_70/images03/20230726/2d2fd6a5c9124c59aa5abc7edac1ff8f.png",
            title: `第${i + pageNo * pageSize}个Item`,
          };
        } else if (i % 3 == 1) {
          item = {
            src: "http://mobileproduct.cdn.sohu.com/prod/img/view/2023/08/25/MY8fzrHi.png",
            title: `第${i + pageNo * pageSize}个Item`,
          };
        } else {
          item = {
            src: "https://p3.itc.cn/q_70/images03/20230504/475a11ce1a3f474e90cf8632ba18d4bb.jpeg",
            title: `第${i + pageNo * pageSize}个Item`,
          };
        }
        data.push(item);
      }
      return new Promise((resolve, reject) => {
        resolve(data);
      });
    },
    renderImgList() {
      this.getImgList(this.pageNo).then((res) => {
        if (res && res.length) {
          const originData = res;
          console.log(originData, "orign");
          let tmpData = [];
          originData.forEach((item, idx) => {
            uni.getImageInfo({
              src: item.src,
              success: (res) => {
                const { width, height } = res;
                let renderHeight = height;
                const w2h = width / height;
                const defaultW2H = 150 / 200;
                if (w2h < defaultW2H) {
                  // 更高
                  renderHeight = Math.floor(this.colWidth / defaultW2H);
                } else {
                  renderHeight = Math.floor(this.colWidth / w2h);
                }
                // console.log('item', item, renderHeight, res)
                tmpData[idx] = { ...item, height: renderHeight };
                if (tmpData.length === originData.length) {
                  this.imgList = this.imgList.concat(tmpData);
                }
              },
              fail: (res) => {
                let renderHeight;
                const defaultW2H = 150 / 200;
                renderHeight = Math.floor(this.colWidth / defaultW2H);
                // console.log('item', item, renderHeight, res)
                tmpData[idx] = { ...item, height: renderHeight };
                if (tmpData.length === originData.length) {
                  this.imgList = this.imgList.concat(tmpData);
                }
              },
            });
          });
          console.log(this.imgList, "img");
        }
      });
    },
    handleScroll(scrollTop) {
      const query = uni.createSelectorQuery().in(this);
      const that = this;
      query
        .select(".waterfall-container")
        .boundingClientRect((data) => {
          if (scrollTop + windowHeight > data.height - rpx2px(110)) {
            that.pageNo = that.pageNo + 1;
            that.renderImgList();
          }
        })
        .exec();
    },
  },
};
</script>
<style lang="less">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.waterfall-container {
  column-count: 2;
  column-gap: 20rpx;
}

.img-container {
  image {
    width: 100%;
  }

  .txt {
    text-align: center;
  }
}
</style>
```

## css 实现瀑布流

### column 布局

瀑布流需要用到的 css 属性是：

```
column-count：指定列数
column-gap：列之间的差距
```

以上面的代码为例，具体的实现方式是：

```css
.waterfall-container {
  column-count: 2;
  column-gap: 20rpx;
}
```

从渲染结果可以看到 column 的排布规律是先从上往下排，然后从左到右排。但这样的排布方式不适合瀑布流动态加载的情况。

### flex 布局

瀑布流需要用到的 css 属性是：

```
flex-direction：指定排列方向，这里指定为纵向排列
flex-wrap：指定换行方式
```

以上面的代码为例，具体的实现方式是：

```css
.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  height: 100vh;
  overflow: scroll;
}
```

从渲染结果可以看到排布规律是先从上往下排，然后从左到右排，且高度固定，无法实现下拉加载新的瀑布流。所以这样的排布方式也不适合瀑布流动态加载的情况。

## js 实现瀑布流

### 绝对定位

实现思路：

1. 设置一个变量 colHeight 记录左右两列的高度
2. 父容器设置宽度和相对定位，子容器设置绝对定位

```vue
<template>
  <view class="waterfall-container">
    <view
      class="img-container"
      v-for="(item, idx) in imgList"
      :key="idx"
      :style="{ width: `${colWidth}rpx` }"
    >
      <image
        :src="item.src"
        :style="{ height: `${item.height}rpx` }"
        v-if="item.height"
      ></image>
      <view class="txt">{{ item.title }}</view>
    </view>
  </view>
</template>
<style lang="less">
.img-container {
  image {
    width: 100%;
  }

  .txt {
    text-align: center;
  }
}
</style>
```

3. 第一行的图片直接从左往右排列；从第一行之后找到两列中最短的一列，将子元素放在该位置、计算它的定位、更新 colHeight

```js
const bottomGap = 60;
const gap = 20;
let tmpData = await getImgList(this.pageNo);
tmpData.forEach((tmpItem, idx) => {
  if (this.pageNo === 0 && (idx === 0 || idx === 1)) {
    tmpItem.left = idx * (this.colWidth + gap);
    tmpItem.top = 0;
    this.colHeight[idx] += tmpItem.height + bottomGap;
  } else {
    const minHeight = Math.min(...this.colHeight);
    const minHeightIdx = this.colHeight.indexOf(minHeight);
    tmpItem.left = minHeightIdx * (this.colWidth + gap);
    tmpItem.top = this.colHeight[minHeightIdx];
    this.colHeight[minHeightIdx] += tmpItem.height + bottomGap;
  }
});
this.imgList = this.imgList.concat(tmpData);
```
这里是假定后端接口会传来图片的高度和宽度，但如果没有实现，则需要借助api如uni.getImageInfo来获取宽高

### flex 布局

## 参考文献

（1）[瀑布流组件陷入商品重复怪圈？我是如何用心一解的！](https://juejin.cn/post/7231194928332144696)
（2）[实现小红书响应式瀑布流](https://juejin.cn/post/7270160291411886132)
（3）[瀑布流的三种实现方案及优缺点](https://juejin.cn/post/7014650146000470053?searchId=202309131727289F8E006475B37A3AC450)
（4）[教你如何实现一个完美的移动端瀑布流组件](https://juejin.cn/post/7086330043038695432?searchId=202309131727289F8E006475B37A3AC450)
