---
title: 带缩略图的图片切换展示实现
date: 2023-11-09 15:04:30
categories:
  - 工作技巧
tags:
  - WEB API
---

简单记录一下做需求时遇到的问题和思考

<!-- more -->

## 需求描述

1. 实现一个带缩略图的图片切换模块；大图片支持左右翻页查看，也支持点选小图查看。
2. 缩略图图片数量较少时整体居中；图片较多时缩略图支持滚动。点击缩略图选中的小图处于正中
3. 点击大图打开预览弹窗，预览可左右滑动查看图片，再次点击退出预览态
4. 预览态图片展示原则：过长的图片，放大且从顶部开始展示，可向下滑动查看；短图居中展示

## 实现思路

1. 因为需求涉及到很多图片切换展示，可使用已有的方案 swiper 组件，如果使用了 vue 框架则使用 vue-awesome-swiper、配合 swiper 以前使用。安装时注意版本问题，高版本的 swiper 只能使用 vue 3 版本的 vue-awesome-swiper 调用，如果要使用 vue2 语法，版本可参考：

```
"swiper": "^5.4.5",
"vue-awesome-swiper": "^4.1.1",
```

带缩略图的图片轮播官网有给实现[案例](https://github.com/surmon-china/surmon-china.github.io/blob/vue2/projects/vue-awesome-swiper/examples/30-thumbs-gallery.vue)
大图的展示使用 swiper 组件没有疑问。但实现的缩略图在轮播条件下样式比较合理，不然首图居中时左侧出现大片空白感觉很奇怪；因此缩略图的实现放弃用 swiper，将父容器设置为溢出滚动，小图包裹在一个容器里，在不滚动的时候利用 flex 布局让小图整体的容器居中

2. 缩略图较多、需要滑动查看缩略图并点击时使选中的缩略图位于父容器中间的实现可以利用浏览器的 API：scrollIntoView。一般说来使用这个 API 时可能直接就使用默认的方法、没有考虑过传参， 但实际上该 API 提供了入参让我们可以改变滚动进视野的方式：

```ts
type alignToTop = boolean;
type scrollIntoViewOptions = {
  behavior: "auto" | "smooth";
  block: "start" | "center" | "end" | "nearest";
  inline: "start" | "center" | "end" | "nearest";
};

interface Element {
  scrollIntoView(arg?: alignToTop | scrollIntoViewOptions): void;
}
```

其中 block 就是决定竖直方向的对齐方式，inline 是决定左右方向的对齐方式，可以对这两个参数进行操作。

3. 图片列表加载时可能需要一些时间，偶尔可能会出现部分图片加载失败。为避免显示失败，需要增加过渡态展示，这里以变量imgLoaded控制，通过监听图片加载的load过程来改变imgLoaded的值，当所有图片加载结束时变更imgLoaded、展示图片。

最后带缩略的图片展示模块的实现大致如下：

```vue
<template>
  <div class="img-list-container">
    <div class="img-list-wrap" v-show="imgList && imgList.length">
      <!-- swiper1 -->
      <swiper
        class="swiper gallery-top"
        :options="swiperOptionTop"
        ref="swiperTop"
        @slideChange="onSlideChange"
      >
        <swiper-slide
          class="img-slide"
          v-for="(item, idx) in imgList"
          :key="idx"
        >
          <img
            :src="item.url"
            class="img-content"
            @click="showPreviewModal"
            v-show="imgLoaded"
            @load="bigPicLoad(item.url, idx)"
            @error="(event) => bigPicLoadFail(item.url, idx, event)"
          />
          <img
            src="./loading.gif"
            class="img-content_0 center"
            v-show="!imgLoaded"
          />
        </swiper-slide>
      </swiper>
      <!-- Thumbs -->
      <div
        :class="[
          'gallery-thumbs',
          imgList && imgList.length < 6 && 'no-scroll',
        ]"
        ref="swiperThumbs"
      >
        <div
          :class="['thumb-wrap', imgList && imgList.length < 6 && 'no-scroll']"
        >
          <div
            :class="['img-thumb', idx === activeIndex && 'img-thumb-active']"
            v-for="(item, idx) in imgList"
            :key="idx"
            @click="(event) => changeActiveIdx(event, idx)"
          >
            <img
              :src="item.url"
              class="img-content"
              v-show="smallImgLoaded"
              @load="smallPicLoad(item.url, idx)"
            />
            <img
              src="./loading.gif"
              class="img-content_0"
              v-show="!smallImgLoaded"
            />
          </div>
        </div>
      </div>
    </div>

    <img-preview
      :currentIdx="activeIndex"
      :imgList="imgList"
      ref="previewModal"
    />
  </div>
</template>
<script>
import ImgPreview from "@/wap/components/ImgPreview.vue";

import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";

export default {
  name: "swiper-thumbs-gallery",
  props: {
    imgList: {
      type: Array,
      default: [],
    },
  },
  components: {
    Swiper,
    SwiperSlide,
    ImgPreview,
  },

  watch: {
    imgList: {
      deep: true,
      handler(newVal) {
        this.activeIndex = 0;
        this.imgLoaded = false;
        this.smallImgLoaded = false;
        this.topCount = 0;
        this.thumbCount = 0;
        this.swiperTop.slideTo(this.activeIndex);
      },
    },
  },
  data() {
    return {
      swiperOptionTop: {
        loop: false,
        loopedSlides: this.imgList.length,
        spaceBetween: 10,
      },
      swiperTop: null,
      swiperThumbs: null,
      activeIndex: 0,
      imgLoaded: false,
      smallImgLoaded: false,
      topCount: 0,
      thumbCount: 0,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.swiperTop = this.$refs.swiperTop.$swiper;
      this.swiperThumbs = this.$refs.swiperThumbs.$swiper;
    });
  },
  methods: {
    bigPicLoad(url, idx) {
      this.topCount++;
      if (this.topCount === this.imgList.length) {
        this.imgLoaded = true;
      }
    },
    bigPicLoadFail(url, idx, event) {
      event.target.style =
        "width:57px;height:43px;position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);";
      this.imgList[idx].url = "./fail.png";
      this.topCount++;
      if (this.topCount === this.imgList.length) {
        this.imgLoaded = true;
      }
    },
    smallPicLoad(url, idx) {
      console.log("small loaded", url, idx, this.imgList.length);
      this.thumbCount++;
      if (this.thumbCount === this.imgList.length) {
        this.smallImgLoaded = true;
      }
    },
    onSlideChange() {
      console.log("swiper", this.swiperTop.activeIndex);
      this.activeIndex = this.swiperTop.activeIndex;
    },
    changeActiveIdx(event, idx) {
      this.activeIndex = idx;
      this.swiperTop.slideTo(this.activeIndex);
      event.target.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
    },
    showPreviewModal() {
      this.$refs["previewModal"].show();
    },
  },
};
</script>

<style lang="less" scoped>
.swiper {
  .swiper-slide {
    background-size: cover;
    background-position: center;
  }
}

.gallery-top {
  height: 387px;
  width: 100%;

  .img-content_0 {
    width: 42px;
    height: 58px;
    padding-top: 149px;
    box-sizing: content-box;
    margin: auto;
  }

  .img-content_-1 {
    width: 57px;
    height: 57px;
    padding-top: 156px;
    box-sizing: content-box;
    margin: auto;
  }

  .txt {
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    line-height: 20px;
    margin-top: 13px;
  }

  .img-content {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .watermark {
    position: absolute;
    right: 7px;
    bottom: 10px;
    width: 79px;
    height: 22px;
  }
}

.gallery-thumbs {
  height: 62px;
  box-sizing: border-box;
  padding: 8px 0;
  overflow-x: scroll;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  &.no-scroll {
    display: flex;
    justify-content: center;
  }

  .thumb-wrap {
    display: flex;
  }

  .img-thumb {
    display: inline-block;
    width: 46px;
    height: 46px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 8px;
    flex-shrink: 0;
    box-sizing: border-box;

    .img-content {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .img-thumb-active {
    border: 2px solid #3269ff;
  }
}
</style>
```

3. 图片的预览实现起来本身并不复杂，还是利用 swiper 组件，但一些细节点需要注意：

- 高度自适应尽量不要用 fit-content 而是 auto，因为在 iOS 系统，部分机型不支持这个属性
- 需要监听从图片展示模块传输的当前图片的 index，操作预览模块的 swiper 跳到该 index 的位置
- 点击事件不要挂在 swiper 和 swiper-slide 组件上，否则无法生效

最终预览模块的实现大致如下：

```vue
<template>
  <div class="preview-list-container" v-show="modalVisible">
    <!-- swiper1 -->
    <swiper
      class="swiper gallery-top"
      :options="swiperOptionTop"
      ref="swiperTop"
      @slideChange="onSlideChange"
    >
      <swiper-slide class="img-slide" v-for="(item, idx) in imgList" :key="idx">
        <div class="img-container" @click="hidden">
          <div class="img-wrap">
            <img :src="item.url" class="img-content" />
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";

export default {
  name: "img-preview",
  props: {
    imgList: {
      type: Array,
      default: [],
    },
    currentIdx: {
      type: Number,
      default: 0,
    },
  },
  components: {
    Swiper,
    SwiperSlide,
  },
  watch: {
    currentIdx: {
      handler(newVal) {
        this.activeIndex = newVal;
        this.swiperTop.slideTo(this.activeIndex);
      },
    },
  },
  data() {
    return {
      swiperOptionTop: {
        loop: false,
        loopedSlides: this.imgList.length,
        spaceBetween: 10,
      },
      swiperTop: null,
      activeIndex: 0,
      modalVisible: false,
    };
  },
  created() {
    this.activeIndex = this.currentIdx;
  },
  mounted() {
    this.$nextTick(() => {
      this.swiperTop = this.$refs.swiperTop.$swiper;
    });
  },
  methods: {
    onSlideChange() {
      this.activeIndex = this.swiperTop.activeIndex;
    },
    show() {
      this.modalVisible = true;
      document.body.style.overflow = "hidden";
    },
    hidden() {
      this.modalVisible = false;
      document.body.style.overflow = "";
    },
  },
};
</script>

<style lang="less" scoped>
.preview-list-container {
  position: fixed;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  background: #000;
  z-index: 2000;

  .img-wrap {
    position: relative;
    width: 100%;
  }

  .toolkit-container {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 15px 24px 48px;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 16px;
    line-height: 22px;
    z-index: 999;

    .toolkit-wrap {
      display: flex;

      .toolkit {
        display: flex;
        align-items: center;
        margin-left: 32px;

        .icon {
          width: 16px;
          height: 16px;
          object-fit: contain;
          margin-right: 4px;
        }
      }
    }
  }
}

.swiper {
  .swiper-slide {
    background-size: cover;
    background-position: center;
  }

  &.gallery-top {
    width: 100%;
    height: 100vh;

    .img-container {
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      overflow-y: scroll;
    }

    .watermark {
      position: absolute;
      right: 7px;
      bottom: 10px;
      width: 79px;
      height: 22px;
    }

    .img-content {
      width: 100%;
      height: auto;
    }
  }
}
</style>
```

## 参考文献

（1）[详细介绍 scrollIntoView 方法](https://segmentfault.com/a/1190000041886147)
