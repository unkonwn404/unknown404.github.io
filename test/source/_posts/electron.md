---
title: electron初步调研
date: 2024-11-20 17:29:59
categories:
  - 工作技巧
tags:
  - electron
---

最近需要开发桌面端，需要研究 electron。这里只打算研究最基础的开发。

<!-- more -->

## 环境配置

是的，electron 事实上连安装本身都是个问题。在换了几个源以后发现只能求助于万能的网络，根据网上的建议，更换了几个 npm 相关的配置

```sh
npm config set registry https://registry.npmmirror.com
npm config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
```

第一个指令是更换了最新的淘宝 npm 源，说不定以后还会变。
然后就是执行指令`npm i electron -D`，经过漫长的等待终于成功了。

## 开发

## 打包

目前 Electron 打包方法分为两大类：

- 社区提供的 Electron Builder
- 官方提供的 Electron Packager 和 Electron Forge
  两方都声称自己已经提供了完整的功能。不过从网上的技术博文来看，还是 Electron Builder 用的更多一些，它的配置简单，涉及的插件少，更适合新手。

### 使用步骤

1. 安装指令`npm i electron-builder -D`
2. 在 package.json 配置安装包相关参数
3. 在 package.json 配置打包指令`electron-builder -mw`指令可以同时打包 mac 和 windows 安装包，如果当前环境是 mac，该指令可以正确执行。但 windows 环境下打不出 mac 包

```json
"build": {
    "icon": "1024.png",
    "publish": [
      {
        "provider": "generic",
        "url": "https://xxx.upload.com/"
      }
    ],
    "directories": {
      "output": "electron_dist"
    },
    "nsis": {
      "include": "build/installer.nsh",
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "test"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64",
            "ia32"
          ]
        }
      ]
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": [
            "x64",
            "universal",
            "arm64"
          ]
        }
      ]
    }
  }
```

这里对常用的配置做一下记录

#### 一般配置

直接放在 build 配置下

- **productName** ：项目名 这也是生成的 exe 文件的前缀名
- **icon** ：图标路径 要求至少 512\*512
- **directories** ：输出文件夹

#### windows 配置

如果要打包 windows 可安装的 exe 文件，需要做 win 配置。鉴于 windows 目前常用的安装程序为 nsis，所以设置打包格式为 nsis，兼容 32 位和 64 位系统
nsis 如果不做任何配置，项目会一键安装到 c 盘，没有用户操作的余地，感觉不太好，所以对配置做了如下更改

```json
"nsis": {
      "include": "build/installer.nsh",//包含的自定义nsis脚本
      "oneClick": false,//是否一键安装
      "allowToChangeInstallationDirectory": true,//允许修改安装目录
      "createDesktopShortcut": true,//创建桌面图标
      "createStartMenuShortcut": true,//创建开始菜单图标
      "shortcutName": "test"//图标名称
}
```

nsis 配置里 include 和 scripts 的区别？

- include：在 nsis 已有的脚本上合并作者自己的自定义安装配置修改，文件路径下的内容应该不包含 nsis 完整的流程
- scripts：用脚本语言对 nsis 安装过程完全自定义

目前我的实力不足，没把握对全过程进行改写，所以只改写了如下内容

```sh
!macro preInit
    SetRegView 64
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{GUID}" "UninstallString"
    ${If} $0 == ''
        WriteRegStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files (x86)\myAPP-electron"
    ${Endif}
    SetRegView 32
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{GUID}" "UninstallString"
    ${If} $0 == ''
        WriteRegStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Program Files (x86)\myAPP-electron"
    ${Endif}
!macroend

!macro customInit
  MessageBox MB_OK "欢迎使用 xxx 安装程序！"
!macroend
```

只是按网上的说法，针对允许修改目录的操作对应修改注册表

#### mac 配置

相比之下 mac 配置比较简单，常见安装包是 dmg，旧系统 universal，新系统 arm64

## 自动更新

自动更新的方法目前调研起来有这么几种：

1. 找台服务器，上传、版本更新、下载、执行安装都自己写，大概像[这篇文章](https://juejin.cn/post/7428154064720412710)一样。
   好处是不受 autoUpdater 限制，但是这个流程感觉还挺麻烦的
2. 使用 electron 内部的 autoUpdater
   但是看起来 windows 的安装只能使用 Squirrel.Windows，好像有点类似一键安装，所以也不支持换文件夹，感觉不友好，再加上[技术太老](https://segmentfault.com/a/1190000007616641?utm_source=sf-similar-article)
3. electron-updater，网上常见的解决方案

但是 electron-updater 的使用方法也有多种：

- github release：需要是公开的，不知道能不能允许在 github 上开一个专门 release 的仓库，而且就现在 github 连接不稳的情况能不能顺利下载呢？有这些问题
- http server：如果按[这篇](https://juejin.cn/post/7302724955700264999?searchId=20241129105329614CF8B9472F2A1AD84D) 的意思只要提供的地址能找到 yml 和 exe 文件就可以下载更新了，那么放在 cdn 上应该也可以吧
- 私有 gitlab：看起来要写 gitlab ci 文件，嗯感觉有点麻烦

如果要检查更新相关的信息打印情况，可以打开终端，执行指令`open ~/Library/Logs/<app name>/main.log`
根据官方示例https://github.com/iffy/electron-updater-example/blob/master/main.js#L117C1-L119C4 应该用 checkForUpdatesAndNotify 就能实现了，但实际上只监听到了可更新资源没有任何操作。。。

## 参考文献

（1）[解决 Electron 安装失败问题的实用指南](https://www.cnblogs.com/bokemoqi/p/18389113)
（2）[详解 Electron 打包](https://juejin.cn/post/7250085815430430781)
（3）[【Electron】electron-builder 打包基础配置介绍](https://juejin.cn/post/7140962767275556901?searchId=2024112617310837464B7109099AA135BE)
