---
title: js实现从utf-8到base64编码
date: 2022-11-29 21:42:55
categories:
  - 工作技巧
tags:
  - Web API
---

编码知识小记

<!-- more -->

## 编码相关概念的辨析

### 编码历史

计算机起源之初，科学家对英语字符与二进制位之间的关系做了统一规定，定义了 128 个字符的编码规则，用七位二进制表示。这套编码规则被称为 ASCII 编码。随着计算机的普及，在不同的地区和国家，当地程序员为了适应本地的语言使用创建了新的字符编码。但不同国家间读取内容时由于编码方式的差异会导致内容乱码，对国际沟通交流造成了障碍。

这时候 Unicode 就出现了。 Unicode 是国际标准字符集，它将世界各种语言的每个字符定义一个唯一的编码，以满足跨语言、跨平台的文本信息转换。Unicode 字符集的编码范围是 0x0000 - 0x10FFFF , 可以容纳一百多万个字符， 每个字符都有一个独一无二的编码，也即每个字符都有一个二进制数值和它对应。

### Unicode、utf-8、utf-16 辨析

Unicode 只是字符集，即很多个字符的集合；而 UTF-8、UTF-16、UTF-32 才是真正的字符编码规则：utf-8 是用一个字节来编码所有的字符，utf-16 是用两个字节来编码所有的字符，utf-32 则选择用 4 个字节来编码。
其中最常见的编码规则是 utf-8，因为互联网的大部分资源都是英文的，使用 utf-8 保存更节省空间。Unicode 转 utf-8 主要是变长编码，有具体表格展示不同 unicode 的编码规则，这里不再赘述。

### Base64 编码

Base64 的编码方法要求把每三个 8bit 的字节转换成四个 6bit 的字节，然后把 6Bit 再添两位高位 0，组成四个 8Bit 的字节。经过 base64 编码后的字符串会比原来长 1/3。

## 前端页面表单数据转 base64

需要注意的点是虽然 html 和 js 的编码是 utf-8，但 js 从页面得到的中文是 utf-16 编码，直接转 base64 是会出错的。
MDN 上给出了最简单的解决方法：

```
function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

// Usage:
utf8_to_b64("✓ à la mode"); // "4pyTIMOgIGxhIG1vZGU="
b64_to_utf8("4pyTIMOgIGxhIG1vZGU="); // "✓ à la mode"
```

里面涉及的流程是：

1. 先用 encodeURIComponent 把 js 的字符串转成 UTF-8 的百分号编码形式。该方法不会对 ASCII 字母和数字及部分 ASCII 标点符号进行编码，非英文字符会先转为 UTF8 的字节码，然后前面加个%进行拼接；
2. 再用 unescape 把百分号编码按字节转化成对应的含有 Latin-1 字符集字符的 js 字符串 （即使它是乱码）；
3. 最后用 btoa 把只含有 Latin-1 的 js 字符串转换成 Base64 编码；根据 MDN 文档，btoa 可以将二进制字符串转为 base64 编码的 ASCII 字符串，在实际操作中发现如果直接对中文编码会抛出错误：‘The string to be encoded contains characters outside of the Latin1 range.’，可以推断 btoa 是可以处理 Latin-1 字符集字符的。

关于这种编码方式，网上也看到有去掉 escape/unescape 的版本，似乎同样能得到预期结果。但是这得到的编码并非 utf-8 转 base64 的结果，在只有 ASCII 码时 unescape 使用与否都能得到一样的答案，然而出现带百分号编码的字符串时省去 unescape 会使编码结果的长度增加了，因为 btoa 编码了百分号；且如果是将编码结果传给其他 API 时会很难理解其内容

## 前端 node.js 转 base64

```
//utf-8 转 base64
const txt = new Buffer('文字').toString('base64');
console.log(txt)

//base64 转 utf-8
const ztxt = new Buffer(txt, 'base64').toString('utf8');
console.log(ztxt)
```

处理起来相对简单，可以直接用 buffer 模块的 api

## 参考文献

（1）[Unicode、UTF-8、UTF-16 终于懂了](https://zhuanlan.zhihu.com/p/427488961)
（2）[Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64#Solution_2_%E2%80%93_escaping_the_string_before_encoding_it)
（3）[为什么 escape 可以使 btoa 正确处理 UTF-8 编码的字符串？](https://best33.com/311.moe)
（4）[Converting to Base64 in JavaScript without Deprecated 'Escape' call](https://stackoverflow.com/questions/30631927/converting-to-base64-in-javascript-without-deprecated-escape-call)
