---
title: 工具函数
date: 2022-08-18 20:31:52
categories:
  - 工作技巧
tags:
  - JavaScript
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

3. url 中搜索参数格式化

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

4. 快速创建 0 - n-1 范围的数组

```
Array.from({length: n}, (_, i) => i)

[...Array(n).keys()]

new Array(n).fill(1).map((_, i) => i)
```

5. 多个数组全组合的情况统计

```
function zuhe(arr,n){
    var pass = new Set();
    var zh = []
    if(n<0 || arr.length < n){throw '参数错误'}
    if(n == 1){
        for(let _arr of arr){
            for(let v of _arr){
                if(!pass.has(v)){ //去重
                    pass.add(v);
                    zh.push([v]);
                }
            }
        }
        return zh;
    }
    for(let i=0; i <= arr.length-n; i++ ){
        for(let v of arr[i]){
            if(!pass.has(v)){ //去重
                pass.add(v);
                let _zh = zuhe(arr.slice(i+1),n-1).map(a=>{
                    a.unshift(v)
                    return a;
                })
                zh = zh.concat(_zh)
            }
        }
    }
    return zh;
}
var arr1 = ["a","b","c"];
var arr2 = ["A","B"];
var arr3 = ["1","2"];

var zh2 = zuhe([arr1,arr2,arr3],2)
var zh3 = zuhe([arr1,arr2,arr3],3)
console.log(zh2)
console.log(zh3)
```
## 参考文献
（1）[js多个数组元素两两组合三三组合](https://segmentfault.com/q/1010000018650936)
