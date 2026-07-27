---
title: 表单提交功能的注意事项
date: 2022-06-05 15:56:09
categories:
  - 踩坑经历
tags:
  - HTML
---

表单提交的操作可以被多个元素触发，包括 input、button、回车键等，需要辨析其中的区别。

<!-- more -->


## input[type="submit"]

如果将 input 的 type 设置为 submit 的话，该组件会变成一个按钮。以下面的代码为例：

```
<form>
  <input name="name">
  <input type="submit" value="提交">
</form>
```

input 的 type 默认值为 text，所以第一个 input 显示为文本框。input 设置 type=submit 后，输入控件会变成一个按钮，显示的文字为其 value 值，默认值是 Submit。
form 具有属性 method，默认值为 GET，所以提交后会使用 GET 方式进行页面跳转。
在上述表单中如果输入 111111 后提交则 url 会变更为/?name=111111

## button

button 也具有 type 和 value 属性，除 IE 浏览器以外 type 都默认 submit。所以会触发表单提交。

```
<form>
 <input name='name'>
 <button>确定</button>
</form>
```

## 回车提交

当表单中只有一个单行 input 的时候可以用回车提交。

以上提交操作都涉及到 URL 的改变，触发页面刷新。如果希望阻止页面的默认提交、自己设计提交逻辑，可以在 form 的 onsubmit 属性对应的函数内部添加`e.preventDefault();`来阻止页面提交刷新。

## 参考资料

（1）[html 中 input submit、button 和回车键提交数据的示例分析](https://www.yisu.com/zixun/118760.html)
（2）[react 监听 移动端 手机键盘 enter 事件](https://blog.csdn.net/weixin_33974433/article/details/93702424)
