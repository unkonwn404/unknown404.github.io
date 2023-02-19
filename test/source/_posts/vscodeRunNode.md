---
title: vscode调试Node代码
date: 2023-02-17 09:46:55
categories:
  - 工作技巧
tags:
  - node.js
---
## 实现操作
1. 点击vscode左侧边栏的三角形状加🐛的符号，如果直接调试当前文件可以先打好断点、点击按钮Run and Debug；如果需要自定义然后点击create a launch.json file
2. 编辑launch.json
```
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}"
        }
    ]
}
```
- 执行单一文件时：修改program的内容，改为要运行的可执行文件或源代码的路径
- 调试服务器时：将配置文件修改为如下内容：
```
"configurations": [
    {
        "type": "node",
        "request": "attach",
        "name": "Attach NestJS WS",
        "port": 9229,
        "restart": true,
        "stopOnEntry": false,
        "protocol": "inspector"
    }
]
```
request由launch改为了attach，目的是为了将Visual Studio Code的调试器绑定到一个已经处于运行状态的应用。这个配置文件的含义是告诉Visual Studio Code的调试进程，去连接127.0.0.1:9229上的应用调试进程去调试。
3. 配置完后点击调试栏的运行，如果是调试服务器接口需要先执行debug指令运行起服务器，以eggjs为例是`egg-bin debug`；以nest为例是`nest start --debug --watch`。此时会启动127.0.0.1:9229的调试进程，如果事先打好断点，在postman上调试本地接口时会在对应接口的逻辑断点前停止运行。
## 参考内容
（1）[让你 nodejs 水平暴增的 debugger 技巧](https://juejin.cn/post/6981820158046109703)
（2）[如何用Visual Studio Code远程调试运行在服务器上的nodejs应用](https://juejin.cn/post/6844903838864900110)
