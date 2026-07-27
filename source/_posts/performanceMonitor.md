---
title: 浅谈WEB前端性能监控
date: 2023-08-25 09:45:27
categories:
  - 技术分享
tags:
  - 前端监控
  - 分享记录
excerpt: 2023技术分享的文档备份
---

## 一、背景

前端页面性能对用户留存、用户直观体验有着重要影响。有调查显示，当页面加载时间超过 2 秒后，加载时间每增加一秒，就会有大量的用户流失，所以做好页面性能优化，无疑对网站来说是一个非常重要的步骤。

## 二、前端性能评判指标

对于 Web 开发人员来说，如何衡量一个 Web 页面的性能一直是一个难题。在这一方面，谷歌团队一直致力于提供各种质量信号的统一指南。

### 2.1 核心 Web 指标

核心 Web 指标旨在适用于所有网页，反映出以用户为中心的结果。该指标并不是固定不变的。2020 年谷歌团队从加载性能、交互性和视觉稳定性方面考虑提出了 3 个核心 Web 指标：最大内容绘制（LCP）、首次输入延迟（FID）、累积布局偏移（CLS）

![](/img/performanceMonitor/web_vital.png)

#### 2.1.1 最大内容绘制（Largest Contentful Paint, LCP）

定义：页面首次开始加载时可视区域内可见的最大图像或文本块完成渲染的相对时间。

LCP 考量的元素类型为：

- `<img>`元素

- 内嵌在`<svg>`元素内的`<image>`元素

- `<video>`元素（使用封面图像）

- 通过 url()函数（而非使用 CSS 渐变）加载的带有背景图像的元素

- 包含文本节点或其他行内级文本元素子元素的块级元素。

#### 2.1.2 首次输入延迟（First Input Delay, FID）

定义：用户第一次与页面交互（例如当他们单击链接、点按按钮或使用由 JavaScript 驱动的自定义控件）直到浏览器对交互作出响应、并实际开始处理事件处理程序所经过的时间。

特点：

- 需要在真实用户环境下测量

- 实际数据与预期可能会有差距较大的情况。真实环境下会出现几种可能性：

a）并非所有用户都会在每次访问您的网站时进行交互。用户发出的交互可能与 FID 无关（如滚动和缩放之类的交互）-> FID 没有值

b）一些用户的首次交互会处于不利的时间段内（当主线程长时间处于繁忙时）-> FID 值较高

c）一些用户的首次交互会处于有利的时间段内（当主线程完全空闲时）-> FID 值较低

由于 FID 值的预期差异，在查看 FID 上报数据时主要关注值的分布并注意较高的百分位数

#### 2.1.3 累积布局偏移（Cumulative Layout Shift, CLS）

定义：整个页面生命周期内发生的所有单次布局偏移分数的总和。

计算方式：

_布局偏移分数 = 影响分数 \* 距离分数_

_布局偏移分数得分范围 0-1，0 表示没有偏移，1 表示最大偏移_

**影响分数**

影响分数测量 _不稳定元素_ 对两帧之间的可视区域产生的影响。

前一帧 _和_ 当前帧的所有 _不稳定元素_ 的可见区域集合（占总可视区域的部分）就是当前帧的 _影响分数_ 。

![](/img/performanceMonitor/cls.png)

在上图中，有一个元素在一帧中占据了一半的可视区域。接着，在下一帧中，元素下移了可视区域高度的 25%。红色虚线矩形框表示两帧中元素的可见区域集合，在本示例中，该集合占总可视区域的 75%，因此其 _影响分数_ 为 0.75 。

**距离分数**

布局偏移分数计算公式的另一部分测量不稳定元素相对于可视区域位移的距离。 _距离分数_ 指的是任何 _不稳定元素_ 在一帧中位移的最大距离（水平或垂直）除以可视区域的最大尺寸维度（宽度或高度，以较大者为准）。

在刚才的示例中，最大的可视区域尺寸维度是高度，不稳定元素的位移距离为可视区域高度的 25%，因此 _距离分数_ 为 0.25。

所以，在这个示例中， _影响分数_ 是 0.75 ， _距离分数_ 是 0.25 ，所以 _布局偏移分数_ 是 0.75 \* 0.25 = 0.1875

### 2.2 Web 指标

除了核心 Web 指标外，还有其他的指标也可用于加载、交互等性能评估

#### 2.2.1 文档加载相关指标

##### 第一字节时间（Time to First Byte，TTFB）

浏览器从请求页面开始到接收第一字节的时间，这个时间段内包括 DNS 查找、TCP 连接和发出请求直到响应的第一个字节到达为止的时延。
![](/img/performanceMonitor/performancetiming.png)

![](/img/performanceMonitor/ttfb.png)

##### DOM 解析完成时间（DOMContentLoaded，DCL）

DomContentLoaded 事件触发的时间。当 **HTML 文档被完全加载和解析完成之后，DOMContentLoaded ** 事件被触发，而无需等待样式表、图像和子框架加载完成。早期网络性能的测量参量

##### 页面加载耗时（Load，L）

onLoad 事件触发的时间。页面所有资源都加载完毕后（比如图片，CSS），onLoad 事件才被触发。早期网络性能的测量参量

#### 2.2.2 内容呈现相关指标

##### 首次绘制（ First Paint，FP）

从开始加载到浏览器 **首次绘制像素** 到屏幕上的时间，也就是页面在屏幕上首次发生视觉变化的时间。但此变化可能是简单的背景色更新或不引人注意的内容，它并不表示页面内容完整性，可能会报告没有任何可见的内容被绘制的时间。

##### 首次内容绘制 （First Contentful Paint，FCP）

浏览器 **首次绘制来自 DOM 的内容** 的时间，内容必须是文本、图片（包含背景图）、非白色的 canvas 或 SVG，也包括带有正在加载中的 Web 字体的文本。

这是用户第一次开始看到页面内容，但仅仅有内容，并不意味着它是有用的内容（例如 Header、导航栏等），也不意味着有用户要消费的内容。

**辨析：FCP 和 LCP 区别**

FCP：第一次看到的内容，不一定有用

LCP：最大内容，在页面加载过程中对应的元素是会发生变化的

![](/img/performanceMonitor/fcpvslcp.png)

#### 2.2.3 交互响应性相关指标

##### 可交互时间（Time to Interactive，TTI）

表示网页第一次 **完全达到可交互状态** 的时间点，浏览器已经可以持续性的响应用户的输入。完全达到可交互状态的时间点是在最后一个长任务（Long Task）完成的时间, 并且在随后的 5 秒内网络和主线程是空闲的。

![](/img/performanceMonitor/tti.png)

## 三、性能监控模式

从技术方面来讲，前端性能监控主要分为两种方式，一种叫做合成监控（Synthetic Monitoring，SYN），另一种是真实用户监控（Real User Monitoring，RUM）。

合成监控：在一个模拟场景里，去提交一个需要做性能审计的页面，通过一系列的工具、规则去运行你的页面，提取一些性能指标，得出一个审计报告。

真实用户监控：在用户结束页面访问的时候，把此次访问产生的性能指标上传到日志服务器、进行数据的提取清洗加工，最后在监控平台上进行展示。

|                | 合成监控 | 真实用户监控 |
| :------------: | :------: | :----------: |
| 实现难度及成本 |   较低   |     较高     |
| 采集数据丰富度 |   丰富   |     基础     |
|   数据样本量   |   较小   |     较大     |
|  是否有侵入性  |    否    |      是      |

### 3.1 合成监控

常见工具： **Lighthouse、PageSpeed、 WebPageTest**

#### 自研合成监控方案

目前常见的合成监控的实现方案为在服务端通过 Puppeteer 访问检测页面，调用 Lighthouse 获取相应指标，计算目标得分并将结果保存在数据库，同时提供给前台页面进行可视化展示。

**Puppeteer**

一个 Node 库，它提供了一个高级 API 来通过 DevTools 协议控制 Chrome。利用 Puppeteer 可以生成一个 Browser 对象，Browser 可以拥有多个页面对象。

**Lighthouse**

Lighthouse 是 Google 开源的自动化工具，用于改进网络应用的质量。它可以作为一个 Chrome 扩展程序运行，或从命令行运行。只需要为 Lighthouse 提供一个要审查的网址，它将针对此页面运行一连串的测试，然后生成一个有关页面性能的报告，从中看看可以采取哪些措施来改进应用。

![](/img/performanceMonitor/lighthouse.png)

Lighthouse 由这几部分组成

Driver（驱动）—— 通过 Chrome Debugging Protocol 和 Chrome 进行交互。

Gatherer（采集器）—— 决定在页面加载过程中采集哪些信息，将采集的信息输出为 Artifact。可自定义。

Audit（审查器）—— 将 Gatherer 采集的 Artifact 作为输入，审查器会对其测试，然后得出相应的测评结果。可自定义。

Report（报告）—— 将审查的结果通过指定的方式报告出来。

合成监控的大致流程为：建立连接-> 收集数据-> 评估结果-> 生成报告-> 数据存储

#### 建立连接

利用 Puppeteer 启动一个无头浏览器，打开一个空白页面。利用 Page 对象的 goto 方法打开目标 URL。然后将 Puppeteer 移交给 Lighthouse，实现方式就是确保 Puppeteer 和 lighthouse 启动时使用同一个端口号

```js
const browser = await puppeteer.launch(); //生成browser实例
const page = await browser.newPage(); //解析一个新的页面。
await page.goto(url); //跳转到 目标url
const options = {
  logLevel: "info",
  output: "html",
  port: new URL(browser.wsEndpoint()).port,
};
const runnerResult = await lighthouse(url, options);
```

移交之后 Lighthouse 通过 Chrome DevTools Protocol 定义的主动指令与事件通知，就实现了操控 Chrome 浏览器，和感知页面加载过程中的各个事件。

#### 收集数据

lighthouse 默认会调用 css-usage、js-usage、viewport-dimensions 等采集器获取数据，同时我们也可以自己设置采集器。所有的采集器继承同一父类 Gatherer，其内部结构为

```js
class Gatherer {
  /**
   * @return {keyof LH.GathererArtifacts}
   */
  get name() {
    // @ts-expect-error - assume that class name has been added to LH.GathererArtifacts.
    return this.constructor.name;
  }

  /**
   * 在页面导航前触发
   * @param {LH.Gatherer.PassContext} passContext
   * @return {LH.Gatherer.PhaseResult}
   */
  beforePass(passContext) {}

  /**
   * 在页面加载完后
   * @param {LH.Gatherer.PassContext} passContext
   * @return {LH.Gatherer.PhaseResult}
   */
  pass(passContext) {}

  /**
   * 在页面加载完毕，且gatherer全部执行完成
   * @param {LH.Gatherer.PassContext} passContext
   * @param {LH.Gatherer.LoadData} loadData
   * @return {LH.Gatherer.PhaseResult}
   */
  afterPass(passContext, loadData) {}
}
```

其中只需要重点关注 3 个钩子方法：beforePass、pass、afterPass，Artifact 取最后一次 Hook 输出的结果，e.g.当 afterPass 未吐出，则采用 pass 结果，以此类推。

以收集器 viewport-dimensions 为例

```js
class ViewportDimensions extends Gatherer {
  async afterPass(passContext) {
    const driver = passContext.driver;
    const dimensions = await driver.executionContext.evaluate(
      () => {
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
          devicePixelRatio: window.devicePixelRatio,
        };
      },
      {
        args: [],
        useIsolation: true,
      }
    );

    const allNumeric = Object.values(dimensions).every(Number.isFinite);
    if (!allNumeric) {
      const results = JSON.stringify(dimensions);
      throw new Error(
        `ViewportDimensions results were not numeric: ${results}`
      );
    }

    return dimensions;
  }
}
```

所有 gatherers 运行完后，就会生成一个中间产物 artifacts，此后 Lighthouse 就可以断开与浏览器的连接，只使用 artifacts 进行后续的分析。

#### 评估结果

审查器将 gather 传来的 artifacts 作为输入进行分数评估操作。和采集器一样，lighthouse 提供标准的审查器，我们可以在继承标准审查器的基础上写自己的审查器，在自己的审查器里，我们通常会用到两个方法：一个是 meta，一个是 audit。meta 方法返回一个对象，该对象包含了该审查器的信息，特别注意的是 requiredArtifacts 字段和 id 字段，requiredArtifacts 字段的值对应着相对应的采集器，id 对应着 config 文件中对应的 audits 数组的内容。audit 方法返回一个对象，内容为这次审查的最终结果，包括 score、details 等字段。

以利用收集器 viewport-dimensions 数据的审查器 content-width 为例

```js
class ContentWidth extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: "content-width",
      // 审查通过时的标题
      title: str_(UIStrings.title),
      // 审查失败时的标题
      failureTitle: str_(UIStrings.failureTitle),
      //标题下关于该指标的描述
      description: str_(UIStrings.description),
      requiredArtifacts: ["ViewportDimensions"],
    };
  }
  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {LH.Audit.Product}
   */
  static audit(artifacts, context) {
    const viewportWidth = artifacts.ViewportDimensions.innerWidth;
    const windowWidth = artifacts.ViewportDimensions.outerWidth;
    const widthsMatch = viewportWidth === windowWidth;
    if (context.settings.formFactor === "desktop") {
      return {
        score: 1,
        notApplicable: true,
      };
    }
    let explanation;
    if (!widthsMatch) {
      explanation = str_(UIStrings.explanation, {
        innerWidth: artifacts.ViewportDimensions.innerWidth,
        outerWidth: artifacts.ViewportDimensions.outerWidth,
      });
    }
    return {
      score: Number(widthsMatch),
      explanation,
    };
  }
}
```

#### 生成报告

审查器的分数结果并不是最终出现在报告的结果，报告是以测试类别 category 为统计结果，配置文件会定义每个测试类别所需的审计项及其分数所占的权重。以 performance 为例，其权重设置为：

```js
{
  'performance': {
    title: str_(UIStrings.performanceCategoryTitle),
    auditRefs: [
    {id: 'first-contentful-paint', weight: 10, group: 'metrics'},
    {id: 'interactive', weight: 10, group: 'metrics'},
    {id: 'speed-index', weight: 10, group: 'metrics'},
    {id: 'total-blocking-time', weight: 30, group: 'metrics'},
    {id: 'largest-contentful-paint', weight: 25, group: 'metrics'},
    {id: 'cumulative-layout-shift', weight: 15, group: 'metrics'},
    // 省略
    ]
  },
}
```

content-width 审查结果在报告中的展示：

![](/img/performanceMonitor/content_width.png)

### 3.2 真实用户监控

#### 数据收集

数据的收集主要利用浏览器提供的 API，performance 提供了多种 API，不同的 API 之间可能会有重叠的部分。

##### PerformanceTiming 数据收集

performance.getEntriesByType("navigation")：可返回从输入 url 到用户可以使用页面的全过程时间统计，单位均为毫秒。（该数据也可通过 new PerformanceObserver.observe('navigation', entryHandler)获取）

![](/img/performanceMonitor/performancetiming.png)

TTFB：responseStart - requestStart

DCL：domContentLoadedEventEnd - fetchStart

L：loadEventStart - fetchStart

performance.getEntriesByType('paint')：可返回 FP 和 FCP 两个时间点的值（该数据也可通过 new PerformanceObserver.observe('paint', entryHandler)获取）

![](/img/performanceMonitor/example.png)

**PerformanceObserver API 相关的数据收集**

**LCP**

利用 PerformanceObserver API 可获取 LCP 相关的信息。由于页面转移到后台后，PerformanceObserver API 仍会继续分发 largest-contentful-paint 条目，所以这部分的数据不能做考虑。如果发生页面隐藏、输入事件(用户的交互行为可能会导致页面元素的可见性变化)则停止 PerformanceObserver 的性能监听，计算 LCP；由于最大内容可能随加载变化，所以选取最后一个作为本次页面加载的 lcp 的值。

```js
const getLCP = (lcp) => {
  if (!isPerformanceObserverSupported()) {
    console.warn("browser do not support performanceObserver");
    return;
  }

  const firstHiddenTime = getFirstHiddenTime();

  const entryHandler = (entry) => {
    if (entry.startTime < firstHiddenTime.timeStamp) {
      lcp.value = entry;
    }
  };

  return observe("largest-contentful-paint", entryHandler);
};
export const initLCP = (store, report, immediately = true) => {
  const lcp = { value: {}, entries: [] };
  const po = getLCP(lcp);

  const stopListening = () => {
    if (po) {
      if (po.takeRecords) {
        po.takeRecords().forEach((entry) => {
          const firstHiddenTime = getFirstHiddenTime();
          if (entry.startTime < firstHiddenTime.timeStamp) {
            lcp.value = entry;
            lcp.entries.push(entry);
          }
        });
      }
      po.disconnect();

      if (!store.has(metricsName.LCP)) {
        const value = lcp.value;
        const metrics = {
          name: metricsName.LCP,
          value: roundByFour(value.startTime, 2),
          entries: value,
        };

        if (immediately) {
          report(metrics);
        }

        store.set(metricsName.LCP, metrics);
      }
    }
  };

  onHidden(stopListening, true);
  ["click", "keydown"].forEach((event) => {
    addEventListener(event, stopListening, { once: true, capture: true });
  });
};
```

**FID**

和 LCP 的计算类似，需要忽视页面转移到后台后 PerformanceObserver API 继续分发的 first-input 条目。first-input 条目的延迟值是通过获取条目的 startTime 和 processingStart 时间戳之间的差值来测量的。

```js
const getFID = () => {
  if (!isPerformanceObserverSupported()) {
    console.warn("browser do not support performanceObserver");
    return;
  }

  const firstHiddenTime = getFirstHiddenTime();

  return new Promise((resolve) => {
    const eventHandler = (entry) => {
      if (entry.startTime < firstHiddenTime.timeStamp) {
        if (po) {
          po.disconnect();
        }
        resolve(entry);
      }
    };

    const po = observe("first-input", eventHandler);

    if (po) {
      onHidden(() => {
        if (po?.takeRecords) {
          po.takeRecords().map(eventHandler);
        }
        po.disconnect();
      }, true);
    }
  });
};
export const initFID = (store, report, immediately = true) => {
  getFID().then((entry) => {
    const metrics = {
      name: metricsName.FID,
      value: roundByFour(entry.processingStart - entry.startTime, 2),
    };

    if (immediately) {
      report(metrics);
    }

    store.set(metricsName.FID, metrics);
  });
};
```

**CLS**

计算 CLS 时需注意布局偏移并不总是坏事，对用户交互（单击链接、点选按钮、在搜索框中键入信息等）进行响应的布局偏移是可以被使用者所接受的。PerformanceObserver 对用户输入 500 毫秒内发生的布局偏移会带有标志，方便在计算中排除这些偏移。

在 CLS 中，有一个叫 **会话窗口** 的术语：一个或多个快速连续发生的单次布局偏移，每次偏移相隔的时间少于 1 秒，且整个窗口的最大持续时长为 5 秒。计算会话窗口时取所有会话窗口中的最大值作为 CLS 的值

```js
const getCLS = (cls) => {
  if (!isPerformanceObserverSupported()) {
    console.warn("browser do not support performanceObserver");
    return;
  }

  const entryHandler = (entry) => {
    if (!entry.hadRecentInput) {
      cls.value += entry.value;
    }
  };
  return observe("layout-shift", entryHandler);
};
export const initCLS = (store, report, immediately = true) => {
  let sessionValue = 0;
  let sessionEntries = [];
  const cls = { value: 0, entries: [] };

  const po = getCLS(cls);

  const stopListening = () => {
    if (po?.takeRecords) {
      po.takeRecords().map((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
          if (sessionValue > metric.value) {
            cls.value = sessionValue;
            cls.entries = sessionEntries;
          }
        }
      });
    }
    po?.disconnect();

    const metrics = {
      name: metricsName.CLS,
      value: roundByFour(cls.value),
      entries: cls.entries,
    };

    if (immediately) {
      report(metrics);
    }

    store.set(metricsName.CLS, metrics);
  };

  onHidden(stopListening, true);
};
```

#### 数据上报

**上报时机**：可以选择拿到数据后立即上报，也可以等用户页面操作结束、关闭隐藏页面时上报

```js
[beforeUnload, unload, onHidden].forEach((fn) => {
  fn(() => {
    const metrics = this.getCurrentMetrics();
    if (Object.keys(metrics).length > 0 && !immediately) {
      reporter(metrics);
    }
  });
});
```

**上报方式**

|      |                  img 请求                  |                 fetch/xhr                 | navigator.sendBeacon() |
| :--: | :----------------------------------------: | :---------------------------------------: | :--------------------: |
| 优点 |                   兼容性                   |                  兼容性                   |    不丢点不延迟加载    |
| 缺点 | 部分浏览器丢点；延时页面加载；get 长度限制 | fetch 丢点，同步 xhr 不丢点，延迟页面卸载 |         兼容性         |

丢点：页面卸载时正在上报的请求丢失

## 参考资料

1. [web vitals](https://web.dev/vitals/)
2. [lighthouse](https://github.com/GoogleChrome/lighthouse)
3. [前端监控 SDK 的一些技术要点原理分析](https://juejin.cn/post/7017974567943536671)
4. [Lighthouse 测试内幕](https://juejin.cn/post/6844903992380637198)
