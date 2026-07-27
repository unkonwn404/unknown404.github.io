---
title: 自定义tabbar的实现
date: 2023-09-21 15:25:02
categories:
  - 工作技巧
tags:
  - 小程序
---

## 问题描述

根据产品需求，要实现小程序的 tabbar 样式自定义、中间按钮凸起的效果

## 解决方法
1. pages.json文件和一般带tabbar的项目一样进行配置（不做配置的话切换页面顶部导航会出现回退键）
2. 自定义tabbar中实现tab页面切换的逻辑：每个tab页都设置id值，切换页面时传入自定义tabbar组件的id值变化，改变tabbar的icon激活样式；在mounted周期隐藏默认的tabbar
```vue
<template>
    <view class="tab-container">
        <view class="tabbar-item" v-for="(item, index) in tabBarList" :class="[item.centerItem ? ' center-item' : '']"
            @click="changeItem(item)" :key="index">
            <view class="item-top">
                <image :src="currentItem == item.id ? item.selectIcon : item.icon"></image>
            </view>
            <view class="item-bottom" :class="[currentItem == item.id ? 'item-active' : '']">
                <text>{{ item.text }}</text>
            </view>
        </view>
    </view>
</template>

<script>
import { tabBarList } from '../utils/constants'
export default {
    props: {
        currentPageId: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            currentItem: 0,
            tabBarList: tabBarList
        }
    },
    methods: {
        changeItem(item) {
            uni.switchTab({
                url: item.path
            });
        }

    },
    mounted() {
        this.currentItem = this.currentPageId
        uni.hideTabBar();
    },

}
</script>

<style lang="less">
.tab-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120rpx;
    padding: 10rpx 80rpx 0;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    border-top: 1rpx solid #999;
    background: #fff;

    .tabbar-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;

        .item-top {
            width: 64rpx;
            height: 64rpx;
            margin-bottom: 10rpx;

            image {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }

        .item-bottom {
            font-size: 20rpx;
            color: #999;
        }

        &.center-item {
            position: absolute;
            top: -50rpx;
            left: calc(50% - 50rpx);
            background: #fff;
            width: 100rpx;
            border: 1px solid;
            border-radius: 10rpx;
            padding: 20rpx 0;
            box-sizing: border-box;
        }
    }
}
</style>
```

3. 将自定义的tabbar引入页面

## 参考文献
（1）[uniapp 自定义 tabbar，中间凸起](https://blog.csdn.net/weixin_56650035/article/details/118027317)
