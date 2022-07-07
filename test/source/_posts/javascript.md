---
title: Javascript基础
tags:
  - JavaScript
excerpt: <p>前端面试常考内容之JavaScript。</p>
categories:
  - 前端基础
date: 2022-06-18 20:58:57
---

<!-- toc -->

## js 数据类型

- 基本类型：null,undefined,string,bool,number,bigInt,symbol
- 引用类型：object,array,date

存储位置：

- 基本类型：栈，占据空间小，大小固定
- 引用类型：堆，占据空间大，大小不固定；栈中存储指向实体起始地址

null vs undefined：null 是空对象，undefined 是声明的变量未定义

## js 类型判断

### typeof

适用于判断基本类型，除 typeof null==‘object’其他都可以识别

### instanceof

使用于判断引用类型，其原理是是判断在其原型链中能否找到该类型的原型。

```
function myInstanceOf(left,right){
  var prototype=right.prototype
  var left=left._proto_
  while(true){
    if(left==null||left==undefined)return false;
    if(left==prototype)return true;
    left=left._proto_
  }
}
```

### Object.prototype.toString.call

辨析：为什么不直接用 obj.toString？
Array、Function 类型作为 Object 实例重写了 toString 方法

### 延伸问题：数组判断

1. Array.isArray（arr）
2. arr instanceof Array
3. Object.prototype.toString.call（arr）

## js 类型转换

### 其他类型转换为 boolean

|               原类型               | boolean |
| :--------------------------------: | :-----: |
| false、null、undefined、0、''、NaN |  false  |
|                其他                |  true   |

### 其他类型转换为 number

|  原类型   | number |
| :-------: | :----: |
| undefined |  NaN   |
|   null    |   0    |
|   false   |   0    |
|   true    |   1    |
|  string   |  NaN   |
|    ''     |   0    |
| 非空对象  |  NaN   |

### 其他类型转换为 string

|  原类型   |      string       |
| :-------: | :---------------: |
| undefined |    'undefined'    |
|   null    |      'null'       |
|   false   |      'false'      |
|   true    |      'true'       |
|  number   |    `${number}`    |
|  [ 1,2 ]  |       '1,2'       |
| 非空对象  | [ object Object ] |

### ==强制转换规则
{% image center clear type-change.jpeg  %}
如图所示，主要有以下几个步骤：
1. 类型是否相同
2. 是否null==undefined
3. string==number？是的话统一number
4. 是否有boolean？有的话boolean转number
5. object==string/number/symbol？是的话object返回原始类型比较
6. 返回false

#### object转原始类型
1. 调用valueOf，如果转换为基础类型，则返回
2. 调用toString，如果转换为基础类型，则返回
3. 报错

#### ==与Object.is的区别
==存在隐形类型转换
使用 Object.is 来进行相等判断时，一般情况下和三等号的判断相同，即不存在类型转换。它处理了一些特殊的情况，比如 -0 和 +0 不再相等，两个 NaN 是相等的。
### 四则运算转换
1）+情况一方是字符串，则字符串拼接
2）其他情况存在数字另一方则转数字
## 对象拷贝
### 浅拷贝
定义：拷贝对象间享有相同的引用数据
1. **Object.assign**
2. **...扩展符**
3. **slice、concat**

### 深拷贝
定义：两个对象有各自的存储区间
1. **JSON.stringify**
缺点：不能拷贝函数和循环引用
2. 递归函数
```
function deepCloneObj(obj){
  var newObj=Array.isArray(obj)?[]:{}
  for(let key in obj){
    if(obj.hasOwnProperty(key)){
      newObj[key]=typeof obj[key]=='object'?deepCloneObj(obj[key]):obj[key]
    }
  }
  return newObj
}
```
## 原型和原型链
**原型**：_proto_指向的对象
**原型链**：当对象某一属性在当前对象找不到时会沿_proto_属性向上一个对象查找，如果没有就沿着_proto_属性继续向上查找，这个查找依据的规则就是原型链
{% image center clear proto-pic.jpg  %}

## 继承
### 原型链继承
```
Child.prototype=new Parent()
```
基本思路：利用原型让一个引用类型继承另一个引用类型的属性和方法
特点：引用类型被共享，不可向父实例传参
### 构造函数继承
```
function Child(){
  Parent.call(this)
}
```
基本思路：在子类型的构造函数中调用超类型构造函数
特点：每次创建实例都会创建一次方法，不能继承原型属性或者方法。
### 组合继承（原型链继承+构造函数继承）
```
function Child(){
  Parent.call(this)
}
Child.prototype=new Parent()
Child.prototype.constructor=Child
```
基本思路：使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。
特点：调用了两次父类函数
### 原型继承
```
function object(o){
    function F(){};
    F.prototype = o;
    return new F();
}
```
基本思路：可以基于已有的对象创建新的对象，同时还不必因此创建自定义类型。
特点：可以实现基于一个对象的简单继承，不必创建构造函数；但缺点类似原型链继承
### 寄生式继承
基本思路：创建一个仅用于封装继承过程的函数，该函数在内部以某种方式增强对象，最后返回这个对象。
特点：在主要考虑对象而不是自定义类型和构造函数的情况下，实现简单的继承；缺点类似构造函数继承
### 寄生组合型继承
```
function extend(subClass,superClass){
  var f=function(){}//预防子类原型和父类原型共用，原型链不清
  f.prototype=superClass.prototype
  subClass.prototype=new f()
  subClass.prototype.constructor=subClass
  return subClass
}
```
基本思路：继承原型时，继承的不是超类的实例对象，而是原型对象是超类原型对象的一个实例对象，这样就解决了基类的原型对象中增添了不必要的超类的实例对象中的所有属性的问题。
特点：解决了组合型调用2次父类构造函数的问题

## this
### this的指向
this指向最后调用它的对象
### 改变this指向的方法
1）箭头函数   2）call、apply、bind   3）new
### this绑定
显式绑定：call、apply、bind
隐式绑定：直接被对象所包含的函数调用时
默认绑定：全局环境默认绑定到window
new绑定
