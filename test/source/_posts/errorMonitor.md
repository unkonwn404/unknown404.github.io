---
title: 前端监控平台搭建
date: 2023-03-02 13:20:45
categories:
  - 技术分享
tags:
  - 前端监控
  - 分享记录
excerpt: 2020技术分享的文档备份
---

## 一、前言

通常情况下对上线的前端项目进行修改 bug 时，只能依赖用户使用时的反馈，开发者来根据用户所描述的场景去模拟这个错误的产生，效率较低

### 1.1 常见的监控平台

|                |                               sentry                                |          webfunny           |                                       fundebug                                       |
| :------------: | :-----------------------------------------------------------------: | :-------------------------: | :----------------------------------------------------------------------------------: |
|    支持平台    | 前端 JavaScript、Vue、React、Angular、React Native 以及后端 Node.js | h5，PC，微信小程序，uni-app | 前端 JavaScript、微信小程序、微信小游戏、支付宝小程序、React Native 以及后端 Node.js |
|    是否开源    |                                 是                                  |             否              |                                          否                                          |
| 支持私有化部署 |                                 是                                  |             是              |                                          否                                          |
|      费用      |                             80 美元/月                              |         1500 元/年          |                                      159 元/月                                       |

使用三方监控的缺点：SDK 并非都是开源，扩展性差，难以覆盖到全端；报错数据不能完全保证私有；要管理公司内部的多个项目时 sentry 的收费会增加

### 1.2 监控平台构成

![](/img/web-monitor.png)

SDK 模块：负责采集和上报功能，数据如何采集、采集哪些端，上报哪些信息
服务器：负责存储和管理功能，上报的数据结构应该是什么样，数据怎么分类
可视化平台：总结异常情况，发送给使用者

## 二、SDK 实现

### 2.1 SDK 架构

**monorepo**

![](/img/mono-repo.png)

特点：一种管理代码的方式，即一个大的 Git 仓库，管理所有的代码。所有的代码处于同样的规则，同样的约束。

优势： 1.分模块打包、分模块热更新、分包发布（提高开发体验） 2.抽离抽象类、工具类到某个包，代码结构清晰（降低耦合性，提高代码可读性）

**包与包之间关系（mito 为例）**

![](/img/mito.png)

各端 SDK 依赖相同的公共包和核心包，core 将客户端的一些共通操作抽离成 baseClient 下的方法由客户端 SDK 继承和实现

### 2.2 SDK 原理

#### 2.2.1 SDK 报错实现

整体代码架构使用发布-订阅设计模式以便后续迭代功能，处理逻辑基本都在 HandleEvents 文件中

![](/img/monitor-sdk.png)

##### 2.2.1.1 监听/重写原生事件

SDK 采集的常见错误包括：

1. JS 错误和资源错误
   通过 window.addEventListener 来监听 window 的 error 事件，注意拦截操作放在捕获阶段，一方面因为资源加载错误不会冒泡到 window 上，另一方面防止业务代码的阻止冒泡捕获不到事件
   判断是否是资源错误的要点：判断 e.target.localName 是否有值，有的话就是资源错误

```JavaScript
handleError(errorEvent) {
    const { target } = errorEvent;
    if (target.localName) {
    // 资源加载错误 提取有用数据
        const data = resourceTransform(errorEvent.target);
        return reportData.send(data);
    }
    // code error
    const {
    message, filename, lineno, colno, error,
    } = errorEvent;
    let result;
    if (error && isError(error)) {
        result = extractErrorStack(error, LEVEL.Normal);
    }
    // 处理 SyntaxError，stack 没有 lineno、colno
    if (result) {
        HandleEvents.handleNotErrorInstance(message, filename, lineno, colno);
    }
    result.type = ERRORTYPES.JAVASCRIPT_ERROR;
    reportData.send(result);
}
```

2. 接口错误：所有的请求第三方库都是基于 xhr、fetch 二次封装的，所以只需要重写这两个事件就可以拿到所有的接口请求的信息，通过判断 status 的值来判断当前接口是否是正常的。
   监控原生事件，如果不支持 addEventListener，那么就是重写原生函数拿到入参，再将原函数返回。
   以 fetch 为例：

```JavaScript

function fetchIntercept() {
    //拿到老的 fetch 函数
    const oldFetch = window.fetch;
    // 重写
    window.fetch = function (url, config) {
        return oldFetch.apply(window, [url, config]).then((res) => {
                const tempRes = res.clone()
                tempRes.text().then((data) => {
                console.log('method',config.method)
                console.log('url',url)
                console.log('reqData',config.body)
                console.log('status', tempRes.status)
            })
            return res
        },
        (err) => {
            console.log(err)
        throw err
        })
    }
}
```

3. unhandledrejection 错误
   当 Promise 被 reject 且没有 reject 处理器的时候，会触发 unhandledrejection 事件
   通过 window.addEventListener 可以监听 window 的 unhandledrejection 事件

**Vue 报错捕获**
Vue 提供了一个函数 errorHandler 供开发者来获取框架层面的错误，所以直接重写该方法并拿到入参即可

```JavaScript
Vue.config.errorHandler = function (err, vm, info) {
    handleVueError.apply(null, [err, vm, info, LEVEL.Normal, LEVEL.Error, Vue])
}
```

重写函数需要区分 vue2 和 vue3 的区别

**React 报错捕获**

- 渲染错误：errorBoundary 组件 React16.13 中提供了 componentDidCatch 钩子函数来回调错误信息，所以我们可以新建一个类 ErrorBoundary 来继承 React，然后然后声明 componentDidCatch 钩子函数，可以拿到错误信息

```JavaScript
const h = React.createElement
class ErrorBoundary extends React.Component {
    constructor(props) {
    super(props)
    this.state = { hasError: false }
    }

    componentDidCatch(error, errorInfo) {
        MITO.errorBoundaryReport(error)
        if (error) {
            this.setState({
                hasError: true
            })
        }
    }

    render() {
        if (this.state.hasError) {
            return h('div', null, '子组件抛出异常')
        }
        return this.props.children
    }
}
```

```JSX
// 然后用 ErrorBoundary 包裹需要处理的组件
<ErrorBoundary>
    <App />
</ErrorBoundary>
```

- 非渲染错误：window.onerror 可以捕捉到

##### 2.2.1.2 错误上报

**常见的错误上报方式**
| | img 请求 | fetch/xhr | navigator.sendBeacon() |
| :------: | :--------: | :-----------: | :-------: |
| 优点 | 兼容性 | 兼容性 | 不丢点不延迟加载 |
| 缺点 | 部分浏览器丢点；延时页面加载；get 长度限制 | fetch 丢点，同步 xhr 不丢点，延迟页面卸载 | 兼容性 |

丢点：页面卸载时正在上报的请求丢失

**采样上报**

```JavaScript
// 只采集 20%
if(Math.random() < 0.2) {
collect(data) // 记录错误信息
}
```

#### 2.2.2 性能上报原理

PerformanceTiming：会返回一个对象，从输入 url 到用户可以使用页面的全过程时间统计，单位均为毫秒

|     目标指标     |              计算方式               |                 定义                 |
| :--------------: | :---------------------------------: | :----------------------------------: |
|   DNS 解析时间   | domainLookupEnd - domainLookupStart |       从发起页面域名解析至完成       |
| TCP 建立链接时间 |      connectEnd - connectStart      |    从发起 TCP 链接到三次握手完成     |
|     白屏时间     |   responseStart - navigationStart   | 从发起页面请求到服务器返回第一个字节 |

SDK 总结：
监听 / 劫持 原始方法，获取需要上报的数据、调整数据结构，在错误发生时触发函数上报。

## 三、服务器

这个环节，输入是接口接收到的错误记录，输出是有效的数据入库。其核心功能包括对数据进行清洗和对数据进行入库。

### 3.1 数据收集

主要工作： 提供无状态的 API 服务，逻辑较轻。功能包括为 SDK 提供上报接口，进行 cookie 的识别鉴权

### 3.2 数据处理

•可为报错信息提供纬度补充（IP -> 地理位置）， 设备情况（User-Agent ）等 SDK 拿不到的信息。
•由于数据量较大，所以所有数据并不是写在 elasticsearch 的一个索引里面的，这个时候就需要按天建立索引保存数据。

### 3.3 错误存储

常见的技术选型包括：ELK 类系统、Hadoop/Hive、日志服务（SLS）

- ELK 系统：Elasticsearch、Logstash、Kibana 三个系统的合称
  - Elasticsearch：一个近实时的分系统的分布式搜索和分析引擎，它可以用于全文搜索，结构化搜索以及分析。监控系统中 Elasticsearch 可以用来完成日志的检索、分析工作。
  - Logstash：一个用于管理日志和事件的工具，你可以用它去收集日志、转换日志、解析日志并将他们作为数据提供给其它模块调用，例如搜索、存储等。
  - Kibana：一个优秀的前端日志展示框架，它可以非常详细的将日志转化为各种图表，为用户提供强大的数据可视化支持。

日志数据在 ELK 系统流向
![](/img/elk.png)

- Hadoop/Hive：Hadoop 是一个存储计算框架，其核心的设计就是：HDFS 和 MapReduce。HDFS 为海量的数据提供了存储，则 MapReduce 为海量的数据提供了计算。Hive 是基于 Hadoop 的一个数据仓库工具，可以将结构化的数据文件映射为一张数据库表并提供类 sql 查询功能，减小学习成本。
- 日志服务：由阿里云提供，需要付费。日志服务（SLS）一站式提供数据采集、加工、查询与分析、可视化、告警、消费与投递等功能。

  |          | ELK 类系统 | Hadoop + Hive | 日志服务  |
  | :------: | :--------: | :-----------: | :-------: |
  | 可查延时 |  1~60 秒   | 几分钟~数小时 |   实时    |
  | 查询延时 | 小于 1 秒  |    分钟级     | 小于 1 秒 |

## 四、可视化平台（dofin 为例）

涉及技术：umi+ant design pro

### 4.1 为什么不直接用 Kibana 作为展示的可视化平台？

在测试 SDK 的时候会对 Kibana 打印的日志数据进行分析。但 Kibana 的日志查询、筛选需要对 Lucene 语法有一定的掌握，面向用户性并不是很好；另一方面 Kinbana 不便于前端做很灵活的扩展，例如用户的身份关联、未来的报警等功能实现；使用 Kibana 做如均值的运算并不利于前端人员做后续维护

### 4.2 页面基本需求

#### 4.2.1 错误查看页面

可视化平台的最终目的->how：怎么定位问题
实现目的所需要的信息->what：是什么错误
when：什么时候发生的
where：发生错误所处的环境、问题所在的页面

| 主要页面 |                                          基本需求                                          |
| :------: | :----------------------------------------------------------------------------------------: |
| 错误列表 | 支持多种类型条件搜索，通过筛选来观察错误情况的共通性；通过报错时间来观察同类错误报错频繁度 |
| 错误详情 |           能确认错误的特征信息；对同类错误可以提供趋势表，便于观察错误的波动情况           |

#### 4.2.2 性能查看页面

CDN 测距：监听的是 front-end 工程的一个图片加载的起始时间和结束时间
server 测距：监听的是目标工程域名下的请求

### 4.3 页面扩展需求

#### 4.3.1 权限管理

通常一个项目的维护需要一个团队的协作，如果刚接手项目的成员不熟悉系统误操作了工程的删除会对后端维护造成一定的麻烦，因此参考了 gitlab 成员管理原则进行了权限限制

```JavaScript
//route.ts
routes: [
{
path: '/',
component: '../layouts/BasicLayout',
authority: ['1', '2','3'],
routes: [
{
path: '/admin',
name: '创建者管理页',
authority: ['1','2'],//管理员以上可访问
],
},
......
//basicLayout
useEffect(() => {
    setAuthorized(getMatchMenu(location.pathname || '/', menu, true, true).pop() as any || {
        authority: '4',
    });
}, [location.pathname,menu.length]);
......
 <Authorized authority={authorized!.authority} noMatch={noMatch}>
    {children}
</Authorized>
```

方法：在渲染前获取当前访问的页面的权限（与路由设置的 authority 相关），赋值 authorized.authority，在 Authorized 组件中会将存储在 localStorage 的用户权限等级与组件的 authority 属性进行比较，不匹配则展现默认页面

#### 4.3.2 未来展望：报警系统

报警创建思路

1. 前端针对业务需求设置某类错误的阈值、报警轮询间隔等规则，点击提交时请求与已有的报警规则数据比较，确定是新规则会传到后端
2. 后端根据规则创建定时任务，定时任务的回调函数判断报错数是否超过设定阈值；同时将报警规则传入数据库
3. 从日志服务器获取的每分钟错误数超过设定阈值时通过飞书 hook 报警到对应的群
   ![](/img/alarm.png)

![](/img/robot.png)

## 参考文档

1. https://juejin.cn/post/6987681953424080926#heading-17
2. https://juejin.cn/post/7016897995031445511#heading-14
3. https://juejin.cn/post/6862559324632252430#heading-7
4. https://hub.fastgit.org/kisslove/web-monitoring/blob/e06d28312a17d8a09dbc2997a437f952075c8868/backend_server/business/site.js#L111
5. https://juejin.cn/post/6960919409267474439#heading-4
