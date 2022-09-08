---
title: 工具函数
date: 2022-08-18 20:31:52
categories:
  - 工作技巧
tags:
  - javaScript
---

记录一些常用的工具函数（不定期更新）。

<!-- more -->

1. 两个数组求交集

```
function intersectArr(arr1,arr2){
    return arr1.filter(item=>arr2.includes(item))
}
```

延伸：判断某数组是否包含另一数组的参数（适用于权限验证，用户的权限是否与路由设置的角色权限匹配）

```
function isIntersect(arr1,arr2){
    return arr1.some(item=>arr2.includes(item))
}
```

2. 删除对象中的 null 或 undefined 值
```
const removeNullorUndefinedofObj = (obj) => {
  return Object.entries(obj).reduce(
    (cur, [key, value]) => (value === null || value === undefined ? cur : (cur[key] = value), cur),
    {},
  );
};
```
3. url中搜索参数格式化
```
const parseQuery = () => {
  const search = window.location.search;
  return search
    .slice(1)
    .split("&")
    .reduce((query, it) => {
      const [key, value] = it.split("=");
      query[key] = decodeURIComponent(value);
      return query;
    }, {});
};
```
