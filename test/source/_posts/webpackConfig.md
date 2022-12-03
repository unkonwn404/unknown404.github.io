---
title: webpack配置踩坑经历
date: 2022-09-20 22:15:46
categories:
  - 踩坑经历
tags:
  - webpack
---
## 问题：webpack项目使用域名访问出现Invalid Host header，使用ip可访问
**原因**：新版的webpack-dev-server出于安全考虑,默认检查hostname,如果hostname 不是配置内的,将中断访问。
**解决方法**：找到server的配置文件，添加配置：
```
devServer: {
  disableHostCheck: true,
}
```

