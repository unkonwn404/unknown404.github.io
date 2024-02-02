---
title: 监控告警设计
date: 2024-01-17 15:03:03
categories:
  - 工作技巧
tags:
  - 前端监控
  - redis
  - eggjs
excerpt: 监控告警功能的实现
---

## 前言

监控告警是当年接手的第一个 nodejs 需求，本来想在网上搜搜成熟的方案，然而可能是由于自己搜索能力太差了，没有找到合适的方案，于是自己就按照自己的想法写了一个监控告警的方案。现在回看当时的代码还是觉得有点稚嫩，只能说功能实现了，代码确实能跑。但是不是个稳健的代码自己心里一直没数，也不知道怎么写总结文档，所以一直拖到现在才想起来。可能是个糟糕的方案，但涉及的知识点还是值得记录的。

## 前置条件

- 所有的项目采集到的前端错误都写入了专门的 es 了
- 提供 es 增删改查的能力及可视化展示的服务器是用 eggjs 框架搭建的
- 前端组有自己的一个 redis 库可供全部成员使用

## 目标

- 每个项目都可以配置多个告警规则（例如 "5min 内 js 报错次数超过 10 次"连续触发了 3 次、“30min 内资源错误影响用户数不超过 100 人”连续触发了 4 次）
- 告警规则命中时可以利用飞书机器人发送告警信息

## 实现

### 告警规则校验

要实现如 5min 内 js 报错次数超过 10 次的验证，首先需要统计每 5min 内 js 报错次数。考虑到可能会出现某一时间点报错数激增的情况，5min 的时间窗不应该重叠，重叠的话连续触发次数很容易达成。告警太频繁相当于没有作用，所以希望通过连续次数进行限制，确保告警上报的问题是持续存在的，是必须要检查修正的。分析需求后得出结论：

- 为了检测连续触发次数，**需要建立一个新表**，用于存储每个项目每个告警规则的设置时间间隔内、设置的错误类型它的报错次数
- **新表的数据写入依赖于定时任务**，考虑到不同规则的时间间隔可能设置的不同，定时任务的执行间隔应该为设置时间间隔的最小公约数

因为前端有现成的 redis 库，所以直接用它来存储每个告警规则的设置时间间隔内、设置的错误类型它的报错次数的数据。eggjs 连接 mongo 库需要 npm 安装模块 egg-mongoose（感谢上帝官方有做这种扩展）。在 config/config.default.js 中配置 mongo 连接信息。

```js
module.exports = (appInfo) => {
  // ...
  const mongoose = {
    url: `mongodb://${ip}/`, //端口号可以省略
    options: {
      useNewUrlParser: true,
      auth: {
        user: "username",
        password: "pwd",
      },
    },
    plugins: [],
    loadModel: true,
    app: true,
    agent: false,
  };
  return {
    mongoose,
  };
};
```

之后在 app/model/alarm.js 中定义新表的模型。

```js
// 分钟错误日志数记录
module.exports = (app) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RecordsSchema = new Schema({
    total: {
      type: Number,
    },
    timestamp: {
      type: Number,
    },
    interval: {
      type: Number,
    },
    projectType: {
      type: String,
    },
    errorType: {
      type: String,
    },
    ruleType: {
      type: String,
    },
  });

  return mongoose.model("Records", RecordsSchema);
};
```

之后在 app/service/ 中编写 redis 增删改查功能时，可以直接用 ctx.model.Records 代表表格操作
egg-mongoose 提供的函数比较有限，这里只写一下用到的几种：

- insertMany：插入多项数据
- find：查找数据，没有设置条件则查全部
- remove：删除数据
- deleteMany：删除特定条件数据

eggjs 为约定式目录，所以直接在 app/schedule 下新建一个文件夹，然后在该文件夹下新建一个 js 文件，命名为`checkAlarm.js`，在该文件中编写定时任务。

```js
module.exports = {
  schedule: {
    interval: "1m", // 1 分钟间隔
    type: "worker", // 指定的 worker 执行
  },
  async task(ctx) {
    // 单个报错规则判定
    const queryErrorRecords = async (rule) => {
      const projectType = rule.projectType;
      const type = rule.errorType;

      let endTime = new Date().getTime();
      // 如果没有错误数日志，或当前时间与上一次日志记录的时间点大于规定间隔时，向es发起查询
      if (
        record.length == 0 ||
        Math.round(
          (endTime - record[record.length - 1].timestamp) / (60 * 1000)
        ) >= rule.interval
      ) {
        let startTime = endTime - rule.interval * 60 * 1000;
        const queryBody = {
          track_total_hits: true,
          query: {
            bool: {
              must: [
                {
                  term: {
                    "projectType.keyword": projectType,
                  },
                },
                {
                  match: {
                    type,
                  },
                },
              ],
              filter: [
                {
                  range: {
                    time: {
                      gte: startTime,
                      lte: endTime,
                    },
                  },
                },
              ],
            },
          },
          sort: [
            {
              time: "asc",
            },
          ],
        };
        const body = await ctx.service.esClient.search(queryBody);
        const {
          hits: { hits, total },
        } = body;
        // 分警报类型处理报错
        newRecords.push({
          total: total.value,
          timestamp: endTime,
          interval: rule.interval,
          projectType: projectType,
          errorType: type,
          ruleType: rule.ruleType,
        });
      }
    };

    console.log("调用定时器回调", new Date());
    // 获取报警规则
    let { data, env } = await ctx.service.alertRule.getWarning();
    console.log("current env:", env);
    // 数据格式调整
    let rules = flattenRuleObj(data);
    // 获取和报警轮询相关的错误数日志
    let records = await ctx.service.errorRecord.getRecord();
    let newRecords = [];
    let originalRecords = newRecords.slice();

    if (rules.length) {
      await Promise.all(
        rules.map(async (rule, idx) => {
          await queryErrorRecords(rule);
        })
      );

      // 减少不必要的数据更改
      if (newRecords.length != originalRecords.length) {
        await ctx.service.errorRecord.storeRecord(newRecords, env);
      }
    }

    const currentTime = new Date();
    if (currentTime.getHours() == 2 && currentTime.getMinutes() == 10) {
      await ctx.service.errorRecord.clearRecord(
        currentTime.getTime() - 2 * 60 * 60 * 1000,
        env
      );
    }
  },
};
```

为简化方便展示，这里只展示了部分代码。定时任务启动后，首先查询报警规则，有报警规则设置时针对每一个报警规则进行数据处理（queryErrorRecords）：

- 用 ctx.service.errorRecord.getRecord 获取当前报警规则下时间间隔的报错数统计结果
- 当前定时任务时间点与上一条记录时间点进行对比，如果大于等于设定的时间点，则向 es 进行时间间隔内特定错误的报错数查询，并将新的查询数与之前的时间间隔的报错数数据一起传给 mongo，更新表格
- 为防止表格数据越来越多，每天凌晨 2 点 10 分定时清除 2 点之前的数据

关于为什么用 ctx.service.errorRecord.getRecord 做了全查，是因为告警规则有连续触发次数的设置，同时告警规则的时间间隔是可变动的，所以不好设置查询范围；另一方面要对所有的报警规则都做一次筛选查询感觉对请求接口压力比较大，做一次全查然后在 queryErrorRecords 做筛选处理感觉更合理。

### 告警规则触发

这里只以"5min 内 js 报错次数超过 10 次"连续触发了 3 次 的规则为例进行描述

```js
if (relevantRecord.length >= rule.count - 1 && total.value >= rule.limitValue) {
  // 判断是否符合规则
  // 判别规则1:警报设置连续次数是1时判断本次轮询报错数超过阈值
  // 判别规则2:警报设置连续次数大于1时判断最近几条轮询报错数是否超过阈值
  // 规则2情况下需要考虑关闭警报一段时间重新开启的情况，判断中应该对relevantRecord里的时间戳做检查
  const timeRange = rule.count * rule.interval;
  const isHitRule =
    (relevantRecord.length == 0 && rule.count == 1) ||
    relevantRecord
      .slice(relevantRecord.length - rule.count + 1, relevantRecord.length)
      .every(
        (item, i) =>
          item.total >= rule.limitValue &&
          endTime - item.timestamp < (timeRange + 1) * 60 * 1000
      );
  // 符合规则且设置了webhook时发送警报
  if (isHitRule && rule.webhook) {
    const result = await ctx.service.robot.sendSettingMessage({
      type: "rich-text",
      webhook: rule.webhook,
      msgBody: {
        title: "监控报警通知",
        firstLine: `项目${projectType}在${
          rule.interval
        }min间隔，发生${printErrorName(type)}，错误数超过阈值${
          rule.limitValue
        }，连续${rule.count}次`,
        secondLine: "请点击",
        link: `http://${MainDomain(env)}/#/list/${type}`,
      },
    });
  }
}
```

这里 relevantRecord 就表示与告警规则相关的数据。当本次定时任务发现命中告警规则的时间间隔和错误数时，开始判断规则连续次数是否符合条件（连续次数为 1 直接可以告警）。用于判断的变量是 isHitRule，其逻辑如下：

1. 连续次数为 1，符合告警条件
2. 连续次数大于 1，判断最近几条记录的错误数是否都大于阈值（需滤除关闭告警的时间段带来的误差）
   飞书告警具体实现可以参考之前的文章

### 部署优化

将该定时任务写好后部署到服务器上，发现有时候告警会连续报两次。经过排查后发现部署上的是一个服务器集群，共 6 个服务器，有两个执行的时间太过接近、所以当一个服务器还未传新的数据时另一个服务器也认为符合判定执行了查询、判断、告警，就导致了两次，其他时候的服务器由于读到了之前服务器推入的数据，因此不命中我的时间间隔判断条件
之前本来是希望参考[这篇文章](https://blog.csdn.net/qq_24884955/article/details/82856230)设置一个服务器运行该定时任务，但是 hostname 的 hash 码太乱了，且每次上线都更新一次，没什么用

最终采用的是利用 redis 实现分布式锁的方法。分布式锁是一种在分布式系统中实现资源互斥访问机制。在多个进程或多台机器同时操作一些资源时，redis 生成一个限时的 key，使用 Redis 的 expire 特征，所以最终当用户需要释放资源时，释放 key。

事务锁的实现：

```js
class DBLock {
  constructor(ctx) {
    this._uuid = this.uuid(); // 分布式节点的uuid
    console.log(this._uuid);
    this.Lock = ctx.model.Lock;
  }

  // 基于时间戳生成的uuid
  uuid() {
    var d = Date.now();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }

  // 获取一次锁
  async acquire(name) {
    try {
      await this.Lock.create({
        _id: name,
        acquirer: this._uuid,
        acquiredAt: new Date(),
        updatedAt: new Date(),
      });
      return true;
    } catch (e) {
      console.log("error:" + e);
      return false;
    }
  }

  // 获取锁, 每5s重试一次
  async lock(name, retryInterval = 5000) {
    while (true) {
      if (await this.acquire(name)) {
        break;
      } else {
        await this.sleep(retryInterval);
      }
    }
  }

  // 解锁
  async unlock(name) {
    console.log("unlock");
    await this.Lock.deleteMany({ _id: name, acquirer: this._uuid });
  }

  // 续期
  async renew(name) {
    let result = await this.Lock.updateOne(
      { _id: name, acquirer: this._uuid },
      {
        updatedAt: new Date(),
      }
    );
    console.log("renew");
  }

  // 睡眠
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = DBLock;
```

事务锁主要涉及的操作：

- uuid：唯一标识符生成，是为了解决错误删除其他线程的锁的问题，线程在删除锁的时候，用自己的 uuid 与 Redis 中锁的 uuid 进行比较，如果是自己的锁就进行删除，不是则不删除
- lock：循环获取锁数据，如果获取到则跳出循环，否则等待 5s 后重试。锁数据生成：利用 Redis 的 setNx 命令在 Redis 数据库中创建一个<Key，Value>记录，这条命令只有当 Redis 中没有这个 Key 的时候才执行成功，当已经有这个 Key 的时候会返回失败
- unlock：删除锁数据
- renew：更新锁数据，延长锁的过期时间；主要用于由于业务执行时间长，最终可能导致在业务执行过程中，自己的锁超时，然后锁自动释放了

在定时任务里的使用：

```js
module.exports = {
  schedule: {
    interval: "1m", // 1 分钟间隔
    type: "worker", // 指定的 worker 执行
  },
  async task(ctx) {
    // 。。。
    console.log("调用定时器回调", new Date());
    // 获取报警规则
    let { data, env } = await ctx.service.alertRule.getWarning();
    console.log("current env:", env);
    // 数据格式调整
    let rules = flattenRuleObj(data);
    // 获取和报警轮询相关的错误数日志
    let records = await ctx.service.errorRecord.getRecord();
    let newRecords = [];
    let originalRecords = newRecords.slice();

    if (rules.length) {
      try {
        await dblock.lock("send_errcount");
        if (rules.length) {
          await Promise.all(
            rules.map(async (rule, idx) => {
              await queryErrorRecords(rule);
            })
          );

          // 减少不必要的数据更改
          if (newRecords.length != originalRecords.length) {
            await ctx.service.errorRecord.storeRecord(newRecords, env);
          }
        }
      } finally {
        await dblock.unlock("send_errcount");
      }
    }

    const currentTime = new Date();
    if (currentTime.getHours() == 2 && currentTime.getMinutes() == 10) {
      await ctx.service.errorRecord.clearRecord(
        currentTime.getTime() - 2 * 60 * 60 * 1000,
        env
      );
    }
  },
};
```

在告警规则校验和告警规则触发的操作的之前设置锁，所有操作结束后解锁。

## 参考文献

（1）[egg 服务器集群情况下的定时任务执行操作（2 种方式）](https://blog.csdn.net/qq_24884955/article/details/82856230)
（2）[图解 Redis 和 Zookeeper 分布式锁 | 京东云技术团队](https://juejin.cn/post/7239058077273620536?searchId=2024011811013604AA57490988668AB93E)
