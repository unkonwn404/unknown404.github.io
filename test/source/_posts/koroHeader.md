---
title: koroFileHeader使用技巧
date: 2022-08-18 23:42:15
categories:
  - 工作技巧
tags:
  - vscode插件
---

本来并不想记的，奈何记忆力太差，有些快捷键操作老要翻文档也很讨厌，所以在此简单记录下。
<!-- more --> 

## 配置 setting.json

**方法 1**
点击顶部工具栏的 code 选项，按`首选项 > 设置 > 搜索fileheader > 在setting.json中编辑`的步骤进入 setting.json 文件
**方法 2**
mac: command + p window: ctrl + p 的快捷键指令打开 vscode 命令面板，输入`> Open Settings`

## 配置文件头部注释

头部注释快捷键：window：ctrl+win+i,mac：ctrl+cmd+i

文件头部注释的配置修改主要在 fileheader.customMade 内部操作，通过增加或删除内部的属性来 DIY 合适的文件说明。

默认配置如下：

```
  "fileheader.customMade": {
    "Date": "Do not edit", // 文件创建时间(不变)
    // 文件最后编辑者
    "LastEditors": "git config user.name && git config user.email",
    "LastEditTime": "Do not edit", // 文件最后编辑时间
    "FilePath": "Do not edit" // 文件在项目中的相对路径 自动更新
  }
  // 不填写对应属性即关闭对应功能
```

## 配置函数注释

文件头部注释的配置修改主要在 fileheader.cursorMode 内部操作，通过增加或删除内部的属性来 DIY 合适的函数说明。

默认配置如下：

```
"fileheader.cursorMode":{
    "Description": "",
    "param": "",
    "return": ""
  }
```

### 配置函数使用方法

函数识别快捷键：window：ctrl+win+t,mac：ctrl+cmd+t
**单行函数声明参数提取**
将鼠标光标放置于函数声明那一行，然后按函数注释快捷键生成
**多行函数声明参数提取**
当函数内参数过多时经过 prettier 优化的函数声明会变成多行，这时需要用鼠标左键选择多行函数声明区域，函数声明区域尽量精准，按快捷键生成

### 插件配置项

可以用于决定自动生成注释的时机、注释的格式等内容

## 参考文献

（1）[koroFileHeader配置](https://hub.fastgit.xyz/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE)
