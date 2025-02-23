---
title: Vue
date: 2022-09-18 17:02:00
categories:
  - 前端基础
tags:
  - vue
---

前端 vue 框架方面知识整理。

<!-- more -->

## Vue 相关基本概念

### MVVM 和 MVC 的区别

#### MVVM

- Model 代表数据模型，数据和业务逻辑都在 Model 层中定义；
- View 代表 UI 视图，负责数据的展示；
- ViewModel 负责监听 Model 中数据的改变并且控制视图的更新，处理用户交互操作；

ViewModel 通过双向数据绑定连接 view 和 model，view 和 model 间的同步工作是自动的，无需手动操作 DOM

#### MVC

- Model 代表数据模型，数据和业务逻辑都在 Model 层中定义，Model 发生的变化会通知到 View 层；
- View 代表 UI 视图，负责数据的展示；
- Controller 主要负责用户与应用的响应操作，用户与页面产生交互的时候，Controller 中的事件触发器会调用合适的 model 处理问题；

### 双向绑定/响应式原理

#### Vue 2

Object.defineProperty 劫持数据，添加 setter/getter 属性监听数据变化情况，发消息给订阅者触发监听回调

1. 实现一个监听器 observer：遍历对象属性，添加 setter/getter，数据改变时可通过 setter 听到变化
2. 实现一个编译器 compiler：编译模版，将模版的变量替换为数据，指令节点绑定更新函数
3. 实现一个订阅者 watcher：连接 observer 和 compiler 桥梁，订阅 observer 属性变化消息，接收变化时触发 compiler 更新函数
4. 实现一个订阅器 dep：订阅发布管理模式，统一管理 watcher 和 observer

##### 为什么 defineProperty 不可以监听数组下标的变化 为什么实际应用中还可以监听到数组的增删？

Object.defineProperty 不能直接监听数组下标的变化是因为在 JavaScript 中，对数组的下标赋值操作（如 arr[0] = 1）实际上是通过修改数组对象的内部属性（如 length 等）来实现的，而不是通过属性访问器（getter 和 setter）的方式。

然而，在实际应用中可以通过重写数组的 push、pop、shift、unshift、splice 等方法来实现对数组增删操作的监听。

#### Vue 3

Proxy 可以代理整个对象进行读取、设置、删除属性。通过依赖收集（Dependency Collection）和触发更新（Trigger Update）来实现数据的自动同步：当一个响应式数据被读取时，Vue 3 会收集当前的依赖（即正在执行的副作用函数）；当响应式数据被修改时，Vue 3 会触发所有收集到的依赖，从而更新视图。

### Vue diff 算法

1. 新旧 vnode 对比是不是同类型标签，不是同类型直接替换
2. 如果是同类型标签，执行特有的 patchVnode 方法，判断新旧 vnode 是否相等。如果相等，直接返回。
3. 新旧 vnode 不相等，需要比对新旧节点，比对原则是以新节点为主进行更新

#### vue 2.x - 双端 diff

双端 diff 算法是头尾指针向中间移动，分别判断头尾节点是否可以复用，如果没有找到可复用的节点再去遍历查找对应节点的下标，然后移动。全部处理完之后也要对剩下的节点进行批量的新增和删除。

#### vue 3 - 最长递增子序列、静态标记

Vue 3 中对没有 key 的列表元素采用最长递增子序列算法（LIS），用最少的移动操作来保持节点顺序，尤其在长列表渲染中性能提升显著。
Vue 3 在编译阶段对静态节点打上标记，从而在更新时能够快速跳过静态内容，仅更新动态部分。

### Vue 属性

#### data 为什么是一个函数而不是对象

如果 data 是对象，当组件复用时，由于多个实例引用同一个对象，只要一个实例对这个对象进行操作，其他实例中的数据也会发生变化。

#### vue 为什么 this.foo 可以访问 this.data.foo

Vue 在初始化组件时，会对 data 中的属性进行代理。Vue 使用 Object.defineProperty（Vue 2）或 Proxy（Vue 3） 将 data 中的每个属性代理到组件实例上

#### computed 和 watch 区别

**computed**

1. 支持缓存
2. 不支持异步
3. 如果 computed 属性的属性值是函数，那么默认使用 get 方法，函数的返回值就是属性的属性值；在 computed 中，属性有一个 get 方法和一个 set 方法，当数据被赋值时，会调用 set 方法。
4. 第一次加载时会监听
5. computed 属性函数需要 return

**watch**

1. 不支持缓存
2. 支持异步
3. 监听数据必须是 data 中声明的或者父组件传递过来的 props 中的数据
4. 第一次加载时默认不监听，除非 immediate 为 true
5. watch 属性函数不需要 return

### Vue 模版指令

#### v-show 和 v-if 区别

v-show 只是在 display: none 和 display: block 之间切换。DOM 一直存在
v-if 的话就得说到 Vue 底层的编译了。当属性初始为 false 时，组件就不会被渲染，直到条件为 true，并且切换条件时会触发销毁/挂载组件

#### v-if 和 v-for 共用时控制台报错

Vue 3 里当它们同时存在于一个节点上时，v-if 比 v-for 的优先级更高。这意味着 v-if 的条件将无法访问到 v-for 作用域内定义的变量别名
正确写法：

```
<template v-for="todo in todos">
  <li v-if="!todo.isComplete">
    {{ todo.name }}
  </li>
</template>
```

### Vue3.0 新特性

#### Proxy 替代 Object.defineProperty

##### Proxy 特点

1. 可以直接监听整个对象而非属性；
2. Proxy 可以直接监听数组的变化；
3. Proxy 与 Object.defineProperty 相比有更多拦截方法；
4. Proxy 返回的是一个新对象，可以只操作新的对象达到目的，而 Object.defineProperty 只能遍历对象属性直接修改;

##### Object.defineProperty 特点

1. Object.defineProperty 只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历
2. Object.defineProperty 也不能对 es6 新产生的 Map,Set 这些数据结构做出监听，不能监听数组和对象
3. Object.defineProperty 不能监听新增和删除操作

#### 组合式 API

Vue 之前的风格可以说属于选项式 API，用包含多个选项的对象来描述组件的逻辑，例如 data、methods 和 mounted。组合式 API 是写在标签`<script setup>`的内部的，风格接近 react 钩子函数

##### 特点

1）生命周期钩子只有 onBeforeMount、onMounted、onBeforeUpdate、onUpdated、onBeforeUnmount 和 onUnmounted，不存在跟 beforeCreate 和 created 生命周期相关的钩子
2）父子组件之间的数据交互依赖于函数 defineProps 和 defineEmits、defineExpose
3）不会使用 this（因为不存在组件实例了）
4）需要使用 ref 或者 reactive 创建响应式数据

##### 与选项式相比优点

1. 逻辑复用性好：通过 setup 函数将逻辑模块化，并可直接使用函数导入和返回数据。
2. 逻辑聚合性好：可以将与业务功能相关的逻辑组织在一起，提高了代码的可读性和可维护性。

##### ref 和 reactive 区别

**ref**：通常用来定义常用的基础类型(String,Number,Boolean 等等)，ref 函数包裹的数据需要用.value 来查询
**reactive**：通常用来定义对象

#### 支持 TypeScript

Vue 3.0 是用 TypeScript 编写的，因此支持 TypeScript。
在单文件组件中使用 TypeScript，需要在 `<script>` 标签上加上 lang="ts" 的 attribute。
**类型推断对比**

<table style="text-align:center;">
    <tr> 
      <th></th>
    	<th>组合式API</th>
      <th>选项式API</th>
   </tr>
   <tr> 
      <td>props类型推导</td>
   		<td>defineProps</td>
   		<td>defineComponent</td>
   </tr>
   <tr> 
      <td>emits类型推导</td>
   		<td>defineEmits</td>
   		<td>defineComponent</td>
   </tr>
   <tr> 
      <td>计算属性类型推导</td>
   		<td>泛型参数显式指定computed()类型</td>
   		<td>显式地标记出计算属性的类型</td>
   </tr>
   <tr> 
      <td>事件处理函数类型推导</td>
   		<td colspan="2">显式地强制转换 event 上的属性(例：event.target as HTMLInputElement）</td>
   </tr>
   <tr> 
      <td>ref类型推导</td>
   		<td>Ref传入泛型参数;ref初始化时也会推导类型</td>
   		<td rowspan="2">无</td>
   </tr>
    <tr> 
      <td>reactive类型推导</td>
   		<td>interface定义</td>
   </tr>
</table>

#### 新内置组件 Suspense、Teleport

- **Suspense**：组件有两个插槽：#default 和 #fallback。两个插槽都只允许一个直接子节点。初始渲染时渲染默认的插槽内容。如果遇到异步依赖，则会进入挂起状态。在挂起状态期间，展示的是后备内容。当所有遇到的异步依赖都完成后，将展示出默认插槽的内容。

- **Teleport**：接收一个 to 的属性来指定传送的目标。to 的值可以是 CSS 选择器字符串，也可以是一个 DOM 元素对象。被 Teleport 标签包裹的模块将置于 to 指定的 DOM 之下。适用于子组件调用公共组件如全局提示框的场景

## Vue 生命周期（Vue3.0 版本）

![](/img/life-cycle.png)

### beforeCreate

实例初始化完成、props 解析之后、data() 和 computed 等选项处理之前立即调用。

### created

data、computed、method、watch 已经设置完成。跟 DOM 操作相关的属性方法仍不可使用。

### beforeMount

即将首次执行 DOM 渲染过程。

服务器渲染流程不包括该生命周期。

### mounted

组件挂载完之后调用。挂载完成的定义为：所有同步子组件都已经被挂载且其自身的 DOM 树已经创建完成并插入了父容器中。
该生命周期通常用于执行需要访问组件所渲染的 DOM 树相关的副作用。

服务器渲染流程不包括该生命周期。

### beforeUpdate

响应式数据更新时调用，可以用来在 Vue 更新 DOM 之前访问 DOM 状态。

服务器渲染流程不包括该生命周期。

### updated

调用时，组件 DOM 已经更新，所以可以执行依赖于 DOM 的操作。

服务器渲染流程不包括该生命周期。

### beforeUnmount

一个组件实例被卸载之前调用。当这个钩子被调用时，组件实例依然还保有全部的功能。

服务器渲染流程不包括该生命周期。

### unmounted

一个组件实例被卸载之后调用。可以在这个钩子中手动清理一些副作用，例如计时器、DOM 事件监听器或者与服务器的连接。

服务器渲染流程不包括该生命周期。
**备注**：
Vue2 的生命周期钩子除了最后两个的名称是 beforeDestroy 和 destroyed，其他都一样

### KeepAlive 组件生命周期

#### KeepAlive 组件简介

vue 的内置组件，它的功能是在多个组件间动态切换时缓存被移除的组件实例。

#### activated

在首次挂载、以及每次从缓存中被重新插入的时候调用

#### deactivated

在从 DOM 上移除、进入缓存以及组件卸载时调用

### 适合做异步请求的生命周期

created、beforeMount、mounted 都可以做异步请求，因为在这三个钩子函数中，data 已经创建，可以将服务端端返回的数据进行赋值。
考虑到服务端渲染不包括周期 beforeMount、mounted，异步请求放在 created 一致性更好；另一方面 created 调用异步数据相比其他周期调用页面加载时间会缩短。

### 父子组件嵌套时，父组件和子组件生命周期钩子执行顺序

- **加载渲染过程** 父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted
- **子组件更新过程** 父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
- **父组件更新过程** 父 beforeUpdate -> 父 updated
- **销毁过程** 父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

## 组件间通信

### 父子组件通信

**1）props**
通过 props 传递数据给子组件
**2）emit**
父组件可以通过 v-on 或 @ 来选择性地监听子组件上抛的事件，如示例中自定义的事件 increaseBy；该属性的处理函数可以写在父组件的 method 里
子组件调用内置的 $emit 方法，通过传入事件名称来抛出一个事件；也可以通过设置 emits 属性实现

```
// 父组件
<MyButton @increase-by="(n) => count += n" />

// 子组件
<button @click="$emit('increaseBy', 1)">
  Increase by 1
</button>
```

**3）v-model**
v-model 用于实现表单组件及自定义组件的数据绑定。
当 v-model 指令用于自定义的组件时，Vue3 等效于如下写法：

```
<CustomInput
  :modelValue="searchText"
  @update:modelValue="newValue => searchText = newValue"
/>
```

如果要实现和原生元素 input 一样的绑定效果，自定义组件 CustomInput 内部需要做如下操作：

```
<!-- CustomInput.vue -->
<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

```

子组件中通过将属性 modelValue 和原生元素 input 的 value 绑定，当 input 的值变化时通过 emit 向上传递变化的值

**扩展**：和 Vue2 的 v-model 不同之处

1. 默认 Prop 和 Event 名称
   Vue 2：v-model 默认使用 value 作为 prop，input 作为事件。
   Vue 3：v-model 默认使用 modelValue 作为 prop，update:modelValue 作为事件。

2. 支持多个 v-model 绑定
   Vue 2：每个组件只支持一个 v-model 绑定。
   Vue 3：支持多个 v-model 绑定，这在处理多个状态时特别有用。

**4）ref**
使用选项式 API 时，可以通过 this.$refs.name 的方式获取指定元素或者组件

```
// 父组件

<template>
<child ref="childNode"></child>
</template>
<script>
export default{
  data(){},
  methods:{
    test(){
      this.$refs.childNode.childMethod()
    }
  }
}
</script>

/////////////////////////////////////////////////

// 子组件(child)

<script>
export default{
  data(){},
  methods:{
    childMethod(){
      console.log('test')
    }
  }
}
</script>
```

使用组合式 api 时，需要注意`<script setup>` 语法糖的组件是默认关闭的，也即通过模板 ref 或者 $parent 链获取到的组件的公开实例，不会暴露任何在 `<script setup>` 中声明的绑定
对于该问题的解决方式是子组件使用 defineExpose 明确暴露的属性。如下示例所示：

```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <p>Child Component</p>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
import { ref, defineExpose } from "vue";

export default {
  setup() {
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    // 使用 defineExpose 暴露属性给父组件
    defineExpose({
      count,
      increment,
    });

    return {
      count,
      increment,
    };
  },
};
</script>

<!-- ParentComponent.vue -->

<template>
  <div>
    <p>Parent Component</p>
    <p>Count from Child: {{ childCount }}</p>
    <ChildComponent ref="childRef" />
  </div>
</template>
<script>
import { ref } from "vue";
import ChildComponent from "./ChildComponent.vue";
export default {
  setup() {
    const childRef = ref();
    const childCount = childRef.value.count;
    return {
      childCount,
    };
  },
};
</script>
```

**5) $attrs**
子组件的$attrs 对象包含了除组件所声明的 props 和 emits 之外的所有其他 attribute，例如 class，style，v-on 监听器等等。子组件可以利用`v-bind="$attrs"`将属性传到目标元素上。
vue2 中$listeners包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。而在vue3，$listeners 被移除了

### 兄弟组件通信

#### $parent

`$parent` 可以让组件访问父组件的实例（访问的是上一级父组件的属性和方法）
可以通过共同的父组件来管理状态和事件函数。比如说其中一个兄弟组件调用父组件传递过来的事件函数修改父组件中的状态，然后父组件将状态传递给另一个兄弟组件。

#### eventBus

Vue3 中移除了事件总线，但是可以借助于第三方工具来完成，Vue 官方推荐 mitt 或 tiny-emitter；
但基本的使用方法保持不变，组件 1 使用 emit 函数发送事件名和参数，组件 2 使用 on 函数监听对应的事件名，执行处理函数

### 跨多层次组件通信

#### provide、inject

祖先组件：使用 provide 属性或方法，指定想要提供给后代组件的数据或方法
后代组件：使用 inject 获取祖先组件的值

```vue
// 祖先组件

<script setup>
import { ref, provide } from "vue";
import { fooSymbol } from "./injectionSymbols";

// 提供静态值
provide("foo", "bar");

// 提供响应式的值
const count = ref(0);
provide("count", count);

// 提供时将 Symbol 作为 key
provide(fooSymbol, count);
</script>
///////////////////////////////////////////////// // 后代组件

<script setup>
import { inject } from "vue";
import { fooSymbol } from "./injectionSymbols";

// 注入值的默认方式
const foo = inject("foo");

// 注入响应式的值
const count = inject("count");

// 通过 Symbol 类型的 key 注入
const foo2 = inject(fooSymbol);

// 注入一个值，若为空则使用提供的默认值
const bar = inject("foo", "default value");

// 注入时为了表明提供的默认值是个函数，需要传入第三个参数
const fn = inject("function", () => {}, false);
</script>
```

## Vue 生态

### 单页面应用（SPA）

使用 vue 全家桶构建的项目一般就属于单页面应用项目。其特点为：初始加载时只加载一个 HTML 页面，后续的导航通过 JavaScript 动态地更新页面内容

#### 优点

- 用户体验：加载初始页面后，页面导航可以在不刷新页面的情况下加载和渲染新内容。
- 前后端分离：独立部署，利于开发。
- 负载较低：只有初始页面加载时需要从服务器获取 HTML、CSS 和 JavaScript 文件，减轻了服务器的负载。

#### 缺点

- 首次加载时间：SPA 首次加载时需要下载较大的 JavaScript 文件，这可能导致初始加载时间较长。
- SEO（搜索引擎优化）问题：由于 SPA 的内容是通过 JavaScript 动态生成的，搜索引擎的爬虫可能无法正确地获取和索引页面的内容

### vue-router

#### 前端路由和后端路由区别

前端路由：页面跳转的 URL 规则匹配由前端来控制，把渲染的任务交给了浏览器，通过客户端的算力来解决页面的构建
后端路由：浏览器地址输入栏输入 URL 回车时后端根据路径将对应的 html 模版渲染好返回给前端

#### 直接使用 a 链接与使用 router-link 的区别

抹平了两种模式下 href 的书写方式，会得到正确的 href 值；history 模式下调用 pushState 并阻止默认行为。

#### hash 模式和 history 模式区别

##### hash 模式

开发中默认的模式，它的 URL 带着一个#。
特点：hash 值会出现在 URL 里面，但是不会出现在 HTTP 请求中，对后端完全没有影响。所以改变 hash 值，不会重新加载页面。
原理： hash 模式的主要原理就是监听 onhashchange()事件

##### history 模式

传统的路由分发模式，即用户在输入一个 URL 时，服务器会接收这个请求，并解析这个 URL，然后做出相应的逻辑处理。URL 不会带#。
特点：history 模式下的某些路径如果后台没有配置，URL 输入访问时会返回 404。解决方法为需要在服务器上添加一个简单的回退路由。
原理：通过按钮进行的路由跳转用 pushState、replaceState 来改变路由但不触发后端请求，再用回调函数调用新页面组件；点击浏览器前进后退按钮时监听 popstate 事件进行页面切换

#### $route 和$router 的区别

$route 是“路由信息对象”，包括 path，params，hash，query，fullPath，matched，name 等路由信息参数
$router 是“路由实例”对象包括了路由的跳转方法，钩子函数等。

#### 路由守卫

##### 全局路由钩子

**beforeEach**
触发时机：进入路由之前
应用：登录态判断跳转
**beforeResolve**
触发时机：进入路由之前、可以访问 route 配置中自定义的 meta 变量。在 beforeRouteEnter 之后
应用：页面访问权限判断跳转
**afterEach**
触发时机：进入路由之后
应用：跳转之后滚动条回到顶部

##### 单个路由钩子

**beforeEnter**
在路由配置文件中使用，beforeEnter 属性可传入函数数组
触发时机：只在进入路由时触发，不会在 params、query 或 hash 改变时触发。
应用：为不同的路由配置重定向逻辑

##### 路由组件内钩子

**beforeRouteEnter**
触发时机 ∶ 进入组件前触发，此时组件未创建，不能用 this
**beforeRouteUpdate**
触发时机 ∶ 当前地址改变并且改组件被复用时触发，举例来说，带有动态参数的路径 foo/∶id，在 /foo/1 和 /foo/2 之间跳转的时候，由于会渲染同样的 foo 组件，这个钩子在这种情况下就会被调用。发生在 beforeEnter 前
**beforeRouteLeave**
触发时机 ∶ 离开组件被调用
应用：离开页面前弹出提示语

##### 路由钩子执行生命周期的顺序

1. 导航被触发。
2. 在失活的组件里调用 beforeRouteLeave 守卫。
3. 调用全局的 beforeEach 守卫。
4. 在重用的组件里调用 beforeRouteUpdate 守卫(2.2+)。
5. 在路由配置里调用 beforeEnter。
6. 解析异步路由组件。
7. 在被激活的组件里调用 beforeRouteEnter。
8. 调用全局的 beforeResolve 守卫(2.5+)。
9. 导航被确认。
10. 调用全局的 afterEach 钩子。
11. 触发 DOM 更新。
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。

### vuex

为 Vue.js 应用程序开发的状态管理模式。

#### vuex 属性

- state：数据源存放地
- getters：从基本数据 state 派生出来的数据，store 的计算属性
- mutations：同步提交更改数据的方法(目的：方便调试)
- actions：异步调用 mutation 方法
- module：模块化 vuex

#### vuex vs localStorage

1. 存储位置：vuex 存储在内存，localStorage 则以文件的方式存储在本地
2. 存储内容：localStorage 只能存储字符串类型的数据
3. 持久性：刷新或关闭页面时 vuex 存储的值会丢失，localstorage 不会

### pinia

全新的 Vue 状态管理库，vuex 的代替者。

#### pinia 特点

1. Vue2 和 Vue3 都能支持
2. 抛弃传统的 mutation ，只有 state, getter 和 action ，简化状态管理库
3. 不需要嵌套模块，符合 Vue3 的 Composition api，让代码扁平化
4. TypeScript 支持

#### pinia 数据修改

**简单数据修改**：直接操作 `store.属性名`进行修改
**多条数据修改**：

1. 使用$patch 方法。patch 接受对象和函数作为入参。在涉及集合的修改(例如，从数组中推送、移除、拼接一个元素)的操作，使用对象的语法更加耗时，官方文档推荐使用函数。代码示例：

```
store.$patch({
  var1:store.var1++,
  var2:store.var2++
})
store.$patch((store)=>{
  var1:store.var1++,
  var2:store.var2++
})
```

2. 使用 store 的 action 方法

## Vue 项目开发注意事项

### assets 和 static 的区别

相同点：都是存放静态资源文件。
不同点：assets 中存放的静态资源文件在项目打包时会进行压缩体积，代码格式化操作。static 文件夹下的文件则不会。

### Class 与 Style 如何动态绑定

使用对象语法或数组语法进行绑定。这里以 class 为例，style 类似

- 对象语法

```
<div v-bind:class="{ active: isActive, 'text-danger': hasError }"></div>

data: {
  isActive: true,
  hasError: false
}
```

- 数组语法

```
<div v-bind:class="[isActive ? activeClass : '', errorClass]"></div>

data: {
  activeClass: 'active',
  errorClass: 'text-danger'
}
```

## Vue 的性能优化有哪些

### 编码阶段

v-if 和 v-for 不一起使用
v-for 保证 key 的唯一性
使用 keep-alive 缓存组件
v-if 和 v-show 酌情使用
路由懒加载、异步组件
图片懒加载
节流防抖

### 打包优化

压缩代码
使用 CDN 加载第三方模块
抽离公共文件

### 用户体验

骨架屏
客户端缓存

## 扩展： Vue 和 React 对比
相同点：
- 渐进式框架：以从一个小的功能或页面引入，而不需要全盘接管整个项目

### Vue 和 React 区别

- 数据绑定：Vue 双向数据绑定，React 单向数据流
- 生命周期：Vue 提供完整的生命周期钩子（如 beforeCreate、created、beforeMount 等），React 函数式已没有生命周期，使用 useEffect 来处理生命周期需求。
- 响应式：Vue 使用 Proxy 或 Object.defineProperty 实现，React 不会直接追踪状态依赖变化，而是通过对组件的更新触发 re-render

### Vue 和 React diff 区别

相同点：

- 使用 vdom
- 使用 key 标识列表节点优化渲染
- 大部分情况同层级节点比较

不同点：

- Vue 在编译过程中对静态和动态节点的标记，在更新时，Vue 会跳过这些静态节点的比较；React 每次组件的状态更新时会重新渲染整个虚拟 DOM 树，并且重新比较每个节点
- Vue 的 diff 优化从编译时就开始，而 React 在运行时开始

## 参考文献

（1）[「2021」高频前端面试题汇总之 Vue 篇（下）](https://juejin.cn/post/6964779204462247950/)
（2）[ Vue 这一块拿捏了](https://juejin.cn/post/7064368176846340132)
