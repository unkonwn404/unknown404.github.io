---
title: ES7装饰器语法
date: 2022-09-02 15:50:56
categories:
  - 前端技术体系
tags:
  - ES6
  - JavaScript
---

装饰器是是一种与类（class）相关的语法，用来注释或修改类和类方法。装饰器在 Python 和 Java 等语言中也被大量使用。目前在前端框架 Nestjs 也已经有应用。因此本文主要记录装饰器相关的知识点，帮助理解 Nestjs 程序。

<!-- more -->


## 装饰器模式

装饰器模式是一种结构型设计模式，它允许向一个现有的对象添加新的功能，同时又不改变其结构，是作为对现有类的一个包装。
装饰器是针对这种设计模式的一个语法糖。其用法是：使用 @ 作为标识符，紧跟返回装饰器函数的表达式，被放置在被装饰代码前面。
由于该语法目前还处于第 2 阶段提案中，使用它之前需要使用 Babel 模块编译成 ES5 或 ES6。

## 装饰器用法

装饰器主要用于:

1. 装饰类
2. 装饰方法或属性

### 装饰类

装饰类的时候，装饰器方法一般会接收一个目标类作为参数。

#### babel 编译情况

编译前：

```
@annotation
class MyClass { }

function annotation(target) {
   target.annotated = true;
}
```

编译后：

```
var _class;

let MyClass = annotation(_class = class MyClass {}) || _class;

function annotation(target) {
  target.annotated = true;
}
```

从编译的结果可以看出类装饰器的第一个参数就是要装饰的类，它的功能就是对类进行处理。

#### 类装饰器的作用

1. 给目标类增加静态属性

```
function addAttribute(targetClass) {
  targetClass.isUseDecorator = true;
}

@addAttribute
class TargetClass { }

console.log(TargetClass.isUseDecorator); // true
```

在上面这个例子中，我们定义了 addAttribute 的装饰器，用于为 TargetClass 添加静态属性 isUseDecorator 并设置为 true。
另一方面，类装饰器可以使用表达式传入参数为静态属性赋值，利用装饰器工厂模式。如下面的代码：

```
function addAttribute(content) {
  return function decFn(targetClass) {
    targetClass.content = content;
    return targetClass;
  };
}

@addAttribute('这是内容～～～')
class TargetClass { }

console.log(TargetClass.content); // 这是内容～～～
```

该示例就是为 TargetClass 添加静态属性 content 并用传入的参数‘这是内容～～～’为 content 赋值。这种使用方法更加灵活。

2. 添加原型方法
   既然类装饰器接收的参数就是类定义本身，那么该装饰器也可以通过访问类的 prototype 属性来添加或修改原型方法

```
function decorator(targetClass) {
  targetClass.prototype.decFun = function () {
    console.log('这里是装饰器 decorator 添加的原型方法 decFun~');
  };
}

@decorator
class TargetClass { }

const targetClass = new TargetClass();

console.log(targetClass);
targetClass.decFun();
```

### 装饰方法和属性

#### 预备知识：属性描述符

属性描述符表达了一个属性的相关信息(元数据）,本质上是一个对象。属性主要分为两种：访问器属性和数据属性。

##### 访问器属性

特点：当给属性赋值或者取值的时候，会自动的运行一个函数。
具有描述符属性：configurable、enumerable、get、set

##### 数据属性

特点：在我们使用对象的过程中，对一个对象进行取值和赋值的时候，该属性称之为 数据属性
具有描述符属性：configurable、enumerable、writable、value
如示例所示：

```
var o = {};
o.a = 1;

// 等同于 :
Object.defineProperty(o, "a", {
  value : 1,
  writable : true,
  configurable : true,
  enumerable : true
});
```

两种属性共有的属性为 configurable 和 enumerable。
configurable：是否可配置，默认为 false。为 true 时，表示当前属性的‘属性表述符’对象可以被更改，该属性可以使用 delete 删除
enumerable：是否可枚举，默认为 false。为 true 时，表示当前属性可以被枚举，也就是当前属性是否可以在 for...in 循环和 Object.keys() 中被遍历出来

(value 和 writable)与(get 和 set)是不共存的，只要定义了其中一个，就定下来了该描述符的性质是数据属性还是访问器属性。

#### babel 编译情况

根据[ES6 系列之我们来聊聊装饰器](https://github.com/mqyqingfeng/Blog/issues/109),babel 编译后的方法装饰器可以分为 3 个处理步骤：

1. 拷贝需要装饰的属性其对应的属性描述符
   使用 Object.getOwnPropertyDescriptor 可以获得指定属性的属性描述符。该函数接收两个参数：属性所在对象和要取得描述的属性。
   其中 Babel 的 Class 为了与 decorator 配合而产生了一个属性 initializer
2. 应用多个 decorators 方法：当同一个方法使用多个装饰器模型时，遵从洋葱模型，从外到内进入，然后由内向外执行

```
function decorator1() {
  console.log('decorator1');
  return function decFn1(targetClass) {
    console.log('decFn1');
    return targetClass;
  };
}

function decorator2() {
  console.log('decorator2');
  return function decFn2(targetClass) {
    console.log('decFn2');
    return targetClass;
  };
}
```

假如存在装饰器 decorator1、decorator2，修饰同一个方法 targetFunc，其输出结果为：`decorator1->decorator2->decFn2->decFn1`

```
@decorator1()
@decorator2()
targetFunc()
```

3. 处理需要装饰的属性或方法，属性描述符的调整最终还是由 Object.defineProperty 来实现

#### 方法装饰器使用方法

```
function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Person {
  @readonly
  name = 'zhangsan';
}

const person = new Person();
```

如示例所示，方法装饰器接收的入参同 Object.defineProperty 一致，包括：

- 要定义属性的对象（obj）
- 要定义或修改的属性名或 Symbol（props）
- 要定义或修改的属性描述符（descriptor）

## 装饰器应用

### redux

使用高阶函数 connect 时，需要将代码写成以下格式：

```
class MyReactComponent extends React.Component {}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```

而使用装饰器后代码可简化为：

```
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {};
```

语义也更加简洁明了

### 防抖和节流

在频繁触发事件的场景下，为了提升性能常会用防抖和节流函数，其特点是会返回一个匿名函数。为了能在组件销毁时能有效解绑事件，需要用变量将匿名函数存储起来。但使用装饰器语法后就不需要再设置多余的变量了。防抖装饰器的实现如下：

```
//防抖函数
function _debounce(func, wait, immediate) {

    var timeout;

    return function () {
        var context = this;
        var args = arguments;

        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(function(){
                timeout = null;
            }, wait)
            if (callNow) func.apply(context, args)
        }
        else {
            timeout = setTimeout(function(){
                func.apply(context, args)
            }, wait);
        }
    }
}
//防抖装饰器
function debounce(wait, immediate) {
  return function handleDescriptor(target, key, descriptor) {
    const callback = descriptor.value;

    if (typeof callback !== 'function') {
      throw new SyntaxError('Only functions can be debounced');
    }

    var fn = _debounce(callback, wait, immediate)

    return {
      ...descriptor,
      value() {
        fn()
      }
    };
  }
}
```

在使用时只需要在目标函数上方添加@debounce，传入等待时间和是否立即响应的变量即可。

```
class Toggle extends React.Component {

  @debounce(500, true)
  handleClick() {
    console.log('toggle')
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        button
      </button>
    );
  }
}
```

节流的实现也基本相似，这里不再列举。

## TypeScript 装饰器

在 TypeScript 中，可以实现以下五种装饰器：类装饰器、方法装饰器、属性装饰器、访问器装饰器、参数装饰器

### 类装饰器

格式：

```
function classDecorator<T extends Constructor>(targetClass:T) {

}
```

入参：
targetClass - 类构造器

### 方法装饰器

格式：

```
function methodDecorator(target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) {

}
```

入参：
target - 如果是静态方法就是类的构造器（TargetClass），如果是实例方法就是类的原型（TargetClass.prototype）
propertyName - 函数名
propertyDescriptor - 函数的属性描述符

### 属性装饰器

格式：

```
function propertyDecorator(target: Object, propertyName: string) {

}
```

入参：
target - 如果是静态方法就是类的构造器（TargetClass），如果是实例方法就是类的原型（TargetClass.prototype）
propertyName - 属性名

### 参数装饰器

格式：

```
function parameterDecorator(target: Object, propertyName: string, index: number) {

}
```

入参：
target - 如果是静态方法就是类的构造器（TargetClass），如果是实例方法就是类的原型（TargetClass.prototype）
propertyName - 参数名
index - 参数在函数参数列表的位置

### 访问器装饰器

格式：

```
function accessorDecorator(target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) {

}
```

入参：
target - 如果是静态方法就是类的构造器（TargetClass），如果是实例方法就是类的原型（TargetClass.prototype）
propertyName - 属性名
propertyDescriptor - 函数的属性描述符

## 参考文献

（1）[系列之我们来聊聊装饰器](https://github.com/mqyqingfeng/Blog/issues/109)
（2）[Decorator 装饰器](https://juejin.cn/post/7072883925764276254)
（3）[都 2020 年了，你还不会 JavaScript 装饰器](https://juejin.cn/post/6844904100144889864)
（4）[TypeScript 装饰器的基本语法](https://juejin.cn/post/6996590290555371534)
