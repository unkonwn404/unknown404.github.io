---
title: TypeScript
tags:
  - TypeScript
excerpt: <p>TypeScript一些特性记录和辨析，方便自己记忆，为日后使用准备。</p>
categories:
  - 前端技术体系
date: 2022-03-27 19:05:48
---

<!-- toc -->

## 背景知识

类型系统按照「是否允许隐式类型转换」来分类，可以分为强类型和弱类型。
JavaScript 就属于弱类型语言，灵活性强，但不利的一点是没有编译过程，语言的类型错误只有运行时才会发现（JavaScript 因此被称为动态语言）。而 TypeScript 可以弥补这一点：TypeScript 在运行前需要先编译为 JavaScript，而在编译阶段就会进行类型检查并报错（TypeScript 对应称为静态语言）。同时 TypeScript 增强了编辑器（IDE）的功能，包括代码补全、接口提示、跳转到定义、代码重构等，这在很大程度上提高了开发效率。

本文主要记录一些常用的 typescript 语法及一些需要辨析的注意点。

## anyScript 使用方法

用于代码标红但确实不知道如何声明的场景

```
// @ts-nocheck 禁用整个文件的ts校验，置于文件头顶
// @ts-ignore 禁用单行ts校验，放在报错行的上方使用
any和unknown
```

在遇到确实难以定义类型的场景下可以使用以上方法逃课，以后再思考可能的改进方式。

## 基础类型

在 TypeScript 3.1 的文档里，基础类型包括：boolean,string,number,Array<>,Tuple,any,void,undefined,null,never
简单记录下使用偏少的类型它的特点。

辨析点：

### 1）unknown vs any

unknown 与 any 一样，所有类型都可以分配给 unknown，unknown 类型的值只能赋给 unknown 本身和 any 类型。但 unknown 仍然有静态检测能力，个人理解是 unknown 没有放弃类型的推断，并不是所有类型的内部方法 unknown 类型数据都可以随便调用

### 2）void，null 和 undefined

相同点是这 3 个本身在声明变量的过程中用处不大。

```
let unusable: void = undefined;
let u: undefined = undefined;
let n: null = null;
```

默认情况下 null 和 undefined 是所有类型的子类型。
undefined 也是 void 的一个子集。当你对函数返回值并不在意（number、boolean、undefined 都可以是返回值）时，使用 void 而不是 undefined。

## 接口与类型别名

### 接口

可用于对象类型命名和定义类型参数。
基本语法：`interface SquareConfig {}`
接口名开头需大写，因为定义的是一种类型。

#### 可选属性

使用写法：

```
interface SquareConfig {
  color?: string;
  width?: number;
}
```

根据使用经验，在调用该类型 SquareConfig 的变量其属性时编译等效于：

```
interface SquareConfig {
  color: string｜undefined;
  width: number｜undefined;
}
```

所以假如使用变量的 color 属性调用 string 的默认方法或者赋值给一个 string 变量时就会报错

#### 只读属性

一些对象属性只能在对象刚刚创建的时候修改其值。可以在属性名前用 readonly 来指定只读属性：

```
interface Point {
    readonly x: number;
    readonly y: number;
}
```

辨析点：
**const vs readonly**：const 可以防止变量的值被修改，readonly 可以防止变量的属性被修改。

#### 索引签名

描述了对象索引的类型，还有相应的索引返回值类型。索引签名只支持以下两种：

- 字符串索引签名
- 数字索引签名
  一个接口中最多只能定义一个字符串索引签名，该签名会约束对象类型的所有属性类型。

```
interface NumberDictionary {
  [index: string]: number;
  length: number;    // 可以，length是number类型
  name: string       // 错误，`name`的类型与索引类型返回值的类型不匹配
}
```

### 类型别名

类型别名声明可以为 TypeScript 中任意类型命名
基本语法：`type AliasType=string｜boolean｜number`

### interface 与 type 区别

1. type 可以用于非对象类型，而接口只能用于对象类型
2. 接口可以继承其他对象类型，type 不支持继承只能用交叉类型实现继承效果。

```
<!-- type类型扩展方式 -->
type Name = { name: string };
type Person = Name & { age: number };
<!-- interface类型扩展方式 -->
interface IName { name: string };
interface IPerson extends IName { age: number };
```

3. 接口具有声明合并的行为，type 没有

## 运算符使用

### 非空断言运算符 !

置于变量名后，用于强调元素不是 null 或 undefined。

```
const test=(func:()=>void)=>{
    func!()
}
```

### 可选链运算符 ?.

ES11(ES2020)新增的特性。?.用来判断左侧的变量是否存在，不存在不会继续表达式运算。例如书写 a?.b 时实际上等效于

```
a === null || a === void 0 ? void 0 : a.b;
```

### 空值合并运算符 ??

ES11(ES2020)新增的特性。当左侧的操作数为 null 或者 undefined 时，返回其右侧操作数，否则返回左侧操作数。
let b = a ?? 10 等效于

```
let b = a !== null && a !== void 0 ? a : 10;
```

### 数字分割符\_

可以用于长数字分隔，方便阅读，不会编译进 JavaScript。个人理解类似计算器的数字每隔 3 位加一个逗号方便阅读的作用。

```
let num:number = 12_345.678_9
```

## 内置工具类型

### Partial<T>

作用是将泛型 T 所有属性变为可选属性。

```
type Partial<T> = {
	[P in keyof T]?: T[P]
}
```

### Required<T>

```
作用是将泛型T所有属性变为必选属性。
type Required<T> = {
  [P in keyof T]-?: T[P]
}
```

### Record<K, T>

作用是将 K 中所有属性值转化为 T 类型。K 提供对象属性名的联合类型，T 提供对象属性类型。
因为 K 是用作对象属性名设置，所以参数 K 必须能够赋值给 string ｜ number ｜ symbol 类型。

```
type Record<K extends keyof any,T> = {
  [key in K]: T
}
```

示例：

```
type K='x'|'y'
type R=Record<K,number>
const a:R={x:0,y:0}
```

### Pick<T, K>

作用是将 T 类型中的 K 键列表提取，K 必须为对象类型 T 存在的属性。

```
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

示例：

```
interface Point={x:number,y:number}
type T=Pick<Point,'x'|'y'>//{x:number,y:number}
```

### Omit<T, K>

与`Pick<T, K>`互补。用于去除类型 T 中包含 K 的键值对。如果 K 为 T 不存在的属性则新类型等同于 T。

### Exclude<T, U>

在 T 类型中，去除 T 类型和 U 类型的交集。

### Extract<T, U>

与`Exclude<T, U>`互补。获取 T 类型中所有能赋值给 U 的类型，没有返回 never。

### ReturnType<T>

获取 T 类型(函数)对应的返回值类型。

```
function foo(x: string | number): string | number { /*..*/ }
type FooType = ReturnType<foo>;  // string | number
```

## 参考资料

（1）[TypeScript 高级用法](https://juejin.cn/post/6926794697553739784)
（2）[一篇够用的 TypeScript 总结](https://juejin.cn/post/6981728323051192357#heading-0)
（3）[TypeScript 文档](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
