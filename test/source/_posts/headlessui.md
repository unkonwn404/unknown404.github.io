---
title: HeadlessUI组件库
date: 2025-07-01 17:41:19
categories:
  - 技术学习
tags:
  - headless ui
---

最近开发新项目的时候遇到了一些问题：由于设计绘制的左侧菜单过于个性化，在使用 antd 的 Menu 组件时不得不做了大量调整：包括强行改写 antd 内部 css 样式、每次菜单发生特殊的交互操作时都更新 Menu 的 items 属性的赋值变量。由此产生思考：是否可以使用更基础的功能组件来实现需求、不需要强行复写组件内部的预定样式。

<!-- more -->

## Headless UI

全称是 Headless User Interface （无头用户界面），是一种前端开发的方法论（亦或者是一种设计模式），其核心思想是将 用户界面（UI）的逻辑 和 交互行为 与 视觉表现（CSS 样式） 分离开来。

## 无头组件库

和传统的 UI 组件库（如 Ant Design、Element UI）不同，无头组件库是“只提供逻辑、不提供样式”的组件库。它帮你处理好交互逻辑（比如弹窗开关、键盘控制、焦点管理等），但不渲染任何具体的 HTML / CSS —— 样式、DOM 结构都由你自己决定。
目前比较有名的无头组件库有以下几个：

### Headless UI

作者：Tailwind Labs（也就是 Tailwind CSS 的官方团队）
支持框架：React、Vue
特点：

- 完全无样式、可组合
- 支持无障碍（ARIA）和键盘导航
- 官方推荐搭配 Tailwind 使用，但可任意定制

### Radix UI

支持框架：React
特点：

- 完善的无障碍支持（ARIA）
- 稳定、灵活，且结构清晰
- 组件有独立的分包可以安装

```shell
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tooltip
```

### shadcn/ui

支持框架：React
特点：

- 基于 Tailwind CSS 和 Radix UI
- 不通过 npm 安装，而是直接将组件源代码复制粘贴到项目中,用户可根据自己的需求去修改和扩展代码
  eg.执行指令`npx shadcn@latest add button`后，会直接将组件 Button 的代码加到用户的项目里
- 使用class-variance-authority，组件有了 variant 的功能

### Ark UI

作者：Chakra 团队
支持框架：React、Vue、Solid
特点：

- 利用 Zag. js 为多个 JavaScript 框架提供支持。
- 支持 Tailwind 样式，也可以结合 data-\*和设置 className 来定制样式

```jsx
<Accordion.Root>
  <Accordion.Item className="AccordionItem border-b border-gray-300 data-[state=open]:bg-gray-100">
    {/* … */}
  </Accordion.Item>
</Accordion.Root>
```

```css
.AccordionItem {
  border-bottom: 1px solid #e5e5e5;

  &[data-state="open"] {
    background-color: #f5f5f5;
  }
}
```

## 个人迷思：关于 Menu 组件

因为我是出于 Antd 的 Menu 改造太过复杂所以才希望找个无头 Menu 组件来简化代码，然而事实上在阅读了这些组件的说明文档后，我发现它们的 Menu 组件都是属于下拉菜单 Dropdown，而不是 Antd 的导航菜单栏。可能是因为 Antd 的这种 Menu 组件封装比较重，而无头组件一般比较原子化，如果真要实现 Menu 组件的话，一般来说用 Collapse/Disclosure+Button 等实现
