---
title: nodeJs网络框架简介
date: 2023-05-04 11:44:16
categories:
  - 前端基础
tags:
  - node.js
---

想针对一直在使用的 nodeJs 框架做一个梳理归纳。

<!-- more -->

根据我的个人理解，目前常见的 nodeJS 框架可以分为基础框架和企业级框架。
所谓基础框架就是将 nodeJs 的 http 模块的方法进行了包装，提供了中间件、路由设置、模版渲染等方法。代表性的框架有 express、koa、fastify
而企业级框架则是在基础框架的基础上进一步架构，规定了代码组织复用的规则，集成了数据库、模板引擎的使用方案等，使后端的开发更加轻松，也更贴近业务需求。

## 基础框架

### express

express 是 2010 年提出的框架，目前与其他框架相比更加成熟和稳定，具有更广泛的社区支持和生态系统。
特点：

- 请求处理对象：Node 的 req 和 res 对象
- 异步代码风格：依赖于回调函数和 Promise
- 中间件模式：通过调用 next 函数来链式传递
- 路由处理：express 框架已经集成，不需要额外引入插件

### KOA

由 express 团队开发的，基于 ES6 新特性
特点：

- 请求处理对象：Koa 框架自己封装的对象 ctx.request 和 ctx.response
- 异步代码风格：使用 async 和 await 语言的特性
- 中间件模式：洋葱模型，中间件可以直接返回 promise 对象
- 路由处理：需要中间件如 koa-route

### fastify

号称是快速且低开销的 Web 框架。社区插件丰富，可扩展性强。内置 logger，可以用于代码分析调试。
特点：

- 请求处理对象：Node 的 req 和 res 对象
- 异步代码风格：可使用 async 和 await 语言的特性，也可使用回调函数和 Promise 的书写方式
- 中间件模式：可以直接返回处理结果，也可以使用 next 回调函数来调用下一个中间件
- 路由处理：框架已经集成，不需要额外引入插件

## 企业级框架

### eggJs

Egg.js 是一个基于 koa2 的开源框架。框架本身并没有集成如数据库、模板引擎、前端框架等功能，而是需要引入对应功能的插件（个人认为对于使用者来说这并不是一个非常好的选择，因为如果社区活跃度低，插件的丰富度和质量都会成为问题，最终只能自己花时间去开发）

#### 有明确的约定规范

eggJs 的目录结构大致如下所示，这里相对说明文档做了简化

```
egg-project
├── package.json
├── app.js (可选)
├── agent.js (可选)
├── app
|   ├── router.js
│   ├── controller
│   ├── service (可选)
│   ├── middleware (可选)
│   ├── schedule (可选)
│   ├── view (可选)
│   └── extend (可选)
├── config
└── test
```

目录文件的作用：

- app.js 和 agent.js 用于自定义启动时的初始化工作
- app/router.js 用于配置 URL 路由规则，将符合规则的路由请求发送给对应的目标控制器或模板
- app/controller/\*\* 用于解析用户请求传入的参数，处理后返回相应的结果
- app/service/\*\* 用于编写接口的业务逻辑，内容可以直接写在 controller 文件内部，但分离出来文件逻辑更清晰
- app/middleware/\*\* 用于编写中间件
- app/schedule/\*\* 用于定时任务
- app/view/\*\* 用于放置模板文件
- app/extend/\*\* 用于框架的扩展

eggJs 约定了这些文件后，使用者只需要将实现的代码逻辑放在对应的文件夹下。在框架内部 egg-core 的 loader 会自动去读取对应文件夹下的文件，获取文件名、并将逻辑挂到指定的全局变量中。这里以 service 为例，在[egg-core 的代码中](https://github.com/eggjs/egg-core/blob/2920f6eade07959d25f5c4f96b154d3fbae877db/lib/loader/mixin/service.js)读取了 app/service 目录下的文件，将文件名称作为一个作为属性，挂载在 context 上下文上，然后将对应的 js 文件，暴露的方法赋值在这个属性上。例如 service 文件夹下有一个 alertRule 的 js 文件，内部有 getWarning 方法。在运行项目时 alertRule 就会挂在 ctx.service 下，在 controller 中就可以通过 ctx.service.alertRule.getWarning()调用 service 里的逻辑代码
更详细的内容可以参考[这篇文章](https://juejin.cn/post/6844903716777099278)

```js
"use strict";

const path = require("path");

module.exports = {
  /**
   * Load app/service
   * @function EggLoader#loadService
   * @param {Object} opt - LoaderOptions
   * @since 1.0.0
   */
  loadService(opt) {
    this.timing.start("Load Service");
    // 载入到 app.serviceClasses
    opt = Object.assign(
      {
        call: true,
        caseStyle: "lower",
        fieldClass: "serviceClasses",
        directory: this.getLoadUnits().map((unit) =>
          path.join(unit.path, "app/service")
        ),
      },
      opt
    );
    const servicePaths = opt.directory;
    this.loadToContext(servicePaths, "service", opt);
    this.timing.end("Load Service");
  },
};
```

#### 插件机制

模板引擎、数据库连接都需要下载对应的 plugin；插件的配置需要在 config 文件夹下进行声明

#### 多线程管理

eggJs 的进程模型如下

```
                +--------+          +-------+
                | Master |<-------->| Agent |
                +--------+          +-------+
                ^   ^    ^
               /    |     \
             /      |       \
           /        |         \
         v          v          v
+----------+   +----------+   +----------+
| Worker 1 |   | Worker 2 |   | Worker 3 |
+----------+   +----------+   +----------+
```

Master 作为主线程，启动 Agent 作为秘书进程协助 Worker 处理一些公共事务（日志之类），同时启动 Worker 进程执行真正的业务代码。

### nestJs

nestJs 是基于 express 的开源框架，目录的结构据说和 Spring 有异曲同工之妙(但我没学过)。对 ts 的支持比较好。nestJs 的构建思路和 eggJs 几乎大相径庭。它具有以下特点

#### 去中心化路由

nest 项目没有 router.js 文件，所有的路由通过装饰器与 Controller 绑定。

#### 依赖注入（DI, Dependency Injection）思想

依赖注入是控制反转（IOC，Inversion of Control）的一种应用形式。可以用于解决一个类依赖于另外一个类的情况。

```
class Dog {}

class Person {
  private _pet

  constructor () {
    this._pet = new Dog()
  }
}

const xiaoming = new Person()
```

例如上面这段代码，存在着两个问题：

- Person 类固定依赖于 Dog 类，如果后续 Person 想要依赖于其他宠物类，是无法轻易修改的。
- Dog 类有所变化，比如其属性颜色染成了黑色，Person 类也会直接受到影响。

而如果将 Dog 的实例注入到 Person 类中，则 pet 属性不再强依赖 Dog 类。

```
class Dog {}

class Person {
  private _pet

  constructor (pet) {
    this._pet = pet
  }
}

const doggy = new Dog()
const xiaoming = new Person(doggy) // 将实例化的 dog 传入 person 类
```

在 nestJs 框架中就承担了这样一个任务：一个容器来维护各个对象实例，当用户需要使用实例时，容器会自动将对象实例化给用户。
以初始化的 app 文件为例，在 app.controller.ts 中就是在构造器函数部分注入了 AppService 模块的实例 appService，controller 方法中就可以直接用 this.appService 访问 service 内部的方法，实例化的操作在框架内实现

```
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

#### 模块化思想

Nest.js 应用程序都是由一个或多个模块组成的。每个模块都是一个独立的、封闭的功能单元，负责处理某个具体的业务逻辑或功能。使用指令`nest g resource xxx`就会生成以 xxx 命名的文件夹，内部包括了 controller、service、module 的文件,同时在 app.module.ts 也进行了自动导入，模块加入 imports 中。具体文件结构如下所示

```
test
├── test.controller.ts
├── test.service.ts
├── test.controller.spec.ts
├── test.service.spec.ts
├── test.module.ts
└── dto
    ├── create-test.dto.ts
    └── update-test.dto.ts
```

其中 test.controller.spec.ts 和 test.service.spec.ts 为测试文件。如果不想生成测试文件,可以在 nest-cli.json 中配置

```
 "generateOptions": {
    "spec": false
  }
```

test.controller.ts 用于处理路由传来的数据
test.service.ts 用于写业务相关的逻辑
test.module.ts 相当于一个应用程序的根模块，可以看到它将 TestController 和 TestService 都通过@Module 进行了一个注入
@Module 主要包括以下属性：

- providers：由 Nest 注入器实例化的 provider，并且可以至少在整个模块中共享
- controllers：在这个模块内定义的 controller
- imports：可以注入 其他 module 或者 provider
- exports：引入该模块时可以自动使用的 provider

这里需要注明 provider 其实就是不仅仅是 Service 层，还包括：Sql 的 Dao 层、工具方法等提供

#### 面向切面编程（AOP，Aspect Oriented Programming）

当一个请求打过来时，一般会经过 Controller（控制器）、Service（服务）、Repository（数据库访问） 的链路。如果想在这个调用链路里加入日志记录、权限控制、异常处理等设置时，在调用 Controller 之前和之后加入一个执行通用逻辑的阶段，这个切面的逻辑编程就是 AOP。具体到 nest 中就是 Middleware、Guard、Pipe、Interceptor、ExceptionFilter 的实现
关于这些模块怎么使用，官方文档大致有写，这里只辨析一下 Middleware 和 Interceptor 区别

- Middleware：调用时机发生在路由处理前；书写方式和 express 的中间件相似，回调函数接收 req、res、next 参数
- Interceptor：基于 AOP（面向切面编程）的概念实现的，它可以在请求处理管道的不同阶段中插入逻辑，例如在调用控制器方法之前或之后；Interceptor 内部实现了 intercept 函数，接收了 context 和 next 两个参数，context 是请求上下文，next 是调用链接的切面对象，执行 next.handle() 就会调用目标 Controller，不调用就不会执行

#### 不特别依赖于平台

nest 虽然基于 express，但可以灵活的切换 http 框架和 socket 框架
它采用了适配器模式，express 或者别的平台比如 fastify 只要继承这个适配器的类，实现其中的抽象方法，就能接入到 Nest.js 里。在项目的 main.ts 中调整 NestFactory.create 的入参，增加 serverOrOptions 参数即可实现

## 感想

文末的碎碎念吧。其实个人感觉框架本身的使用并不是很难，一些日常开发照着开发文档抄基本上都能出来。但是对框架的架构去理解就感觉很难：规范内部的代码是怎么整合的？为什么要这么做？这些的理解就很难，如果不涉及深层的开发，读源码也觉得有点浪费时间，毕竟阅历及惯性思维等限制很难去快速理解开发者的思路，而如果没有做架构师、只是开发的话，这个时间的必要性感觉实在是。。。

现在记录下的内容说实话感觉还是很浅层次的内容，也许意义不是很大。但也许当我很久没开发 egg 项目再改写时，不会因为找不到 ctx 上的一些对象名感到疑惑（也许吧。。。）

## 参考文献

（1）[浅谈 NestJS 设计思想（分层、IOC、AOP）](https://juejin.cn/post/7192528039945699386)
（2）[Egg.js 源码分析-项目启动](https://juejin.cn/post/6844903716777099278)
（3）[Nest.js 基于 Express 但也不是完全基于](https://juejin.cn/post/7070377945553977357)
