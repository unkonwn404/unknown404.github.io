---
title: vscode指令
date: 2023-09-07 14:45:32
categories:
  - 备忘录
tags:
  - vscode
---

记录下几个提升效率的 vscode 指令，免得自己突然想不起来又专门查。

<!-- more -->

## 打开 vscode 的 setting

方法一：找到 vscode 顶部菜单，点击首个 tab，按“preferences - setting”的顺序点开

方法二：IDE 界面的左下角的齿轮点开，选择菜单里的 setting

方法三：使用指令`Cmd + Shift + P`（mac）打开命令面板 Command Palette，输入 setting 后点击“Preference：Open User Settings (JSON) ”就会打开用户的设置 json

举例可以修改 editor.stickyScroll.enabled 属性的状态，让 ide 屏幕顶部显示你所在的函数/类，这在阅读较长的代码时比较有用

## 项目切换

指令`control + R`，可在最近打开的几个项目间进行切换

## 文档查找

指令`Cmd + P`，搜索当前项目的文件名

## 函数查找

指令`Cmd + Shift + O`，搜索当前所在文件里的函数名

## 参考文献

（1）[你一定要知道的 7 个 VS Code 技巧](https://juejin.cn/post/7270061728897204282)
