---
title: PWA初识
date: 2025-08-06 11:30:32
categories:
  - 技术学习
tags:
  - PWA
  - 离线化
---

最近回看同事分享的离线化相关文档，想总结一下。

<!-- more -->

## 什么是 PWA？

PWA（Progressive Web App），全称渐进式网络应用，是一种结合了网页和原生应用程序功能的新型应用程序开发方法。PWA 通过使用现代 Web 技术，例如 Service Worker 和 Web App Manifest，为用户提供了类似原生应用的体验。

## PWA 特点

### 可安装

意思是可以像原生 APP 在主屏幕上留有图标。前提是提供 manifest.json，它描述了我们的图标在主屏幕上如何显示，以及图标点击进去的启动页是什么。主要格式如下：

```json
{
  "name": "test",
  "short_name": "test",
  "start_url": "/",
  "display": "fullscreen",
  "theme_color": "#141416",
  "background_color": "#ffffff",
  "description": "test",
  "icons": [
    {
      "src": "https://cdn.com/img/icon.png",
      "sizes": "128x128",
      "type": "image/png"
    }
  ]
}
```

- start_url:设置启动网址
- icons: 各个分辨率下页面的图标

之后用 link 标签引入改 json 即可

```html
<link rel="manifest" href="/assets/manifest.json" />
```

如果浏览器可以找到这个 manifest 文件及里面的 icons 链接，它就会在地址栏里给你显示个按钮，提示用户本网站可以安装为 PWA。
![](/img/pwa/pwa-download.png)

#### PS：PWA 和 electron 桌面应用区别

1. 部署与分发方式
   PWA 可以直接通过网页链接访问，用户可以通过浏览器中的“添加到主屏幕”功能将其安装到设备上，整个过程无需经过应用商店审核。Electron 应用则需要像传统桌面软件一样进行打包分发，生成针对不同操作系统的可执行文件
2. 性能与资源消耗
   在资源占用方面，PWA 明显更为轻量，因为它复用设备上已有的浏览器引擎。而 Electron 由于内置了完整的 Chromium 和 Node.js，应用体积较大且内存占用较高。不过，Electron 在访问系统底层功能方面更具优势，能够调用更多原生 API
3. 平台兼容性与开发成本
   PWA 具有天然的跨平台特性，能够同时在桌面和移动设备上运行。Electron 虽然也支持跨平台，但主要专注于桌面端，包括 Windows、macOS 和 Linux。从开发角度看，PWA 允许开发者使用标准的 Web 技术栈，而 Electron 在此基础上还融入了 Node.js 生态系统，具备更强大的系统集成能力

### 离线化

离线加载本质上是页面所需的各种 js、css 以及页面本身的 html，都可以缓存到本地，不再从网络上请求。这个能力是通过 Service Worker 来实现的。

#### Service Worker

Service Worker 其实也是一个 js 文件（我们下面简称 sw.js），拥有和其他 Web Worker 类似的隔离空间。Service Worker 受到一定的限制，无法直接访问 DOM，只能通过 postMessage() 方法与网页进行通信。

##### 注册

注册的流程如下所示：

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Service Worker 示例</title>
  </head>
  <body>
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker
            .register("/service-worker.js")
            .then(function (registration) {
              console.log("Service Worker 注册成功:", registration.scope);
            })
            .catch(function (error) {
              console.log("Service Worker 注册失败:", error);
            });
        });
      }
    </script>
  </body>
</html>
```

##### Service Worker 处理的事件周期

- install 事件：当 Service Worker 首次下载并准备就绪时触发，一般在这个阶段预缓存关键资源。

```js
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("my-cache").then(function (cache) {
      return cache.addAll(filesToCache);
    })
  );
});
```

- activate 事件：当 Service Worker 开始控制页面时触发，一般在这个事件中清理旧缓存，确保用户使用最新版本。

```js
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            return cacheName !== "my-cache";
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});
```

- fetch 事件：当页面发起网络请求时触发，一般在这个事件中，对网络资源做缓存策略。

```js
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
```

不过一般情况下我们不会直接去用 service worker 的 api 写代码，谷歌提供了一个开源 sdk，叫做 workbox，可以帮我们快速的开发 sw.js。因为实际开发中要解决的缓存问题是比较复杂且重复的，比如一个服务，里边有三个请求只能用缓存，还有十个请求要先缓存再请求，这为直接写 Service Worker 代码带来一些麻烦。

#### workbox

Workbox 是 Google 提供的一个库，用来简化 Service Worker 开发，本质是对 Service Worker API 的封装，提供了现成的缓存策略（CacheFirst、NetworkFirst、StaleWhileRevalidate 等），能帮你生成 service-worker.js 文件，自动注入静态资源清单（precache manifest）支持 runtime caching、缓存过期管理、资源版本控制等复杂逻辑。

#### workbox build

Workbox Build 是 Google Workbox 提供的一个 Node.js 构建工具，
用来在打包阶段（比如 Webpack、Rollup、Gulp 或纯 Node 脚本）自动生成 Service Worker 文件或者注入预缓存清单。

##### workbox build 主要解决的问题：手写预缓存的问题。

PWA 应用有个预缓存机制，这个机制会在 PWA 应用启动的时候把网站的静态资源都后台静默下载下来，这样就能实现桌面端应用的“秒开”效果。如果不用 Workbox Build，你的 Service Worker 必须手动写 预缓存资源列表，文件一更新，你还得自己改 revision，非常麻烦。

##### workbox build 支持两种生成模式：generateSW 和 injectManifest。

###### generateSW 模式

直接生成一个完整的 service-worker.js，包含 Workbox 代码和缓存逻辑。

###### injectManifest 模式

适合想自己写 Service Worker 逻辑，但又想自动生成 precache 列表的情况。

##### workbox 打包插件

这里的编译器指的是 webpack vite 这些工具。相关的插件包括 webpack-pwa-manifest、workbox-webpack-plugin、vite-plugin-pwa。
这些工具一般都会暴露 workbox build 的配置项让你来自定义，同时自己完成一些把 sw 脚本注入到 index.html 中、自动识别打包出的静态资源并生成预加载清单的功能。

这里以 vite-plugin-pwa 为例，安装后在 vite.config.js 文件下增加以下配置：

```js
export default defineConfig({
  // 。。。
  plugins: [
    VitePWA({
      base: "/",
      scope: "/",
      registerType: "autoUpdate",
      injectRegister: "script",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "My Awesome App",
        short_name: "MyApp",
        description: "My Awesome App description",
        theme_color: "#ffffff",
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100, // 最多缓存100张图片
                maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存30天
              },
              cacheableResponse: {
                statuses: [0, 200], // 缓存成功的响应
              },
            },
          },
          {
            urlPattern: /^https:\/\/mobileproducts\.cdn\.sohu\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // CDN图片缓存7天
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,gif}"],
      },
    }),
  ],
});
```

这里配置的一些含义：

- base：打包后的 sw 和 manifest 的引入路径，如果需要和 vite 配置的 basename 不同需要专门配置
- scope：sw 生效范围
- manifest：manifest 文件的基本配置，成功后在控制台 application 中看见，但在本地的打包不会触发浏览器地址栏的下载图标
- workbox：缓存规则配置

需要注意的是 Service Worker 只能在**安全上下文（Secure Context）**中使用：

✅ HTTPS 网站：https://example.com
✅ 本地开发：http://localhost 或 http://127.0.0.1
如果在本地用映射域名打开是看不到注入的 service worker 的

#### 缓存规则配置

配置缓存规则时，需要明确这两个概念：

- **预缓存（Precache）**：在 Service Worker 安装阶段，就把一批静态文件（HTML、CSS、JS、图片等）缓存到浏览器中。
- **运行时缓存（Runtime Cache）**：对动态请求（接口、非核心图片等）在运行时按策略缓存，比如 Cache First、Network First、Stale While Revalidate。

| 特性       | 预缓存（Precache）         | 运行时缓存（Runtime Cache） |
| ---------- | -------------------------- | --------------------------- |
| 缓存时机   | 安装 SW 时一次性缓存       | 资源请求时缓存              |
| 资源列表   | 固定、提前定义             | 动态，取决于运行时请求      |
| 适用资源   | 核心静态资源               | API、图片、CDN 资源等       |
| 离线可用性 | 安装完成后可直接离线使用   | 首次访问需联网，后续可缓存  |
| 版本更新   | 需要更改 revision 才会更新 | 请求返回新数据可自动更新    |

下面是配置的一些缓存规则，主要涉及以下内容：
✧ 缓存优先（Cache First）：优先从缓存返回，若未命中则请求网络返回并缓存

✧ 网络优先（Network First）：优先请求网络返回并缓存，失败时直接返回缓存

✧ 增量更新（Stale-While-Revalidate）：立即返回缓存（如有），同时在后台请求网络更新缓存
➢ 对实时性要求不高，可容忍旧数据

```js
// webpack.config.js
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = {
  plugins: [
    new WorkboxPlugin.GenerateSW({
      swDest: "service-worker.js",
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 13 * 1024 * 1024, // 13MB

      // 预缓存匹配规则（构建输出文件）
      globPatterns: ["**/*.{html,js,css,png,jpg,jpeg,svg,webp}"],

      // 不缓存的文件
      exclude: [/\.html$/, /\.shtml$/],

      runtimeCaching: [
        // 图片缓存
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "image-cache",
            matchOptions: { ignoreVary: true },
            plugins: [
              {
                cacheWillUpdate: async ({ response }) => {
                  if (response.headers.get("Vary")?.includes("*")) return null;
                  return response;
                },
              },
              new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
              }),
            ],
          },
        },

        // JS/CSS 缓存
        {
          urlPattern: ({ request }) =>
            request.destination === "script" || request.destination === "style",
          handler: "CacheFirst",
          options: {
            cacheName: "statics-cache",
            matchOptions: { ignoreVary: true },
            plugins: [
              {
                cacheWillUpdate: async ({ response }) => {
                  if (response.headers.get("Vary")?.includes("*")) return null;
                  return response;
                },
              },
              new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 15 * 24 * 60 * 60, // 15天
              }),
            ],
          },
        },

        // 页面导航缓存
        {
          urlPattern: ({ request }) => request.mode === "navigate",
          handler: "NetworkFirst",
          options: {
            cacheName: "navigation-cache",
            matchOptions: { ignoreSearch: true },
            networkTimeoutSeconds: 3,
            plugins: [
              new workbox.expiration.ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
              }),
              new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [200],
              }),
            ],
          },
        },
        // API 缓存
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/wap/info"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api-cache",
            plugins: [
              new workbox.expiration.ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60, // 1天
              }),
              new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [200],
              }),
            ],
          },
        },

        // API 缓存
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/odin/api/"),
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            networkTimeoutSeconds: 3,
            plugins: [
              {
                cacheKeyWillBeUsed: async ({ request }) => {
                  const url = new URL(request.url);
                  return url.href; // 自定义缓存 key
                },
              },
              new workbox.expiration.ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60, // 1天
              }),
              new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [200],
              }),
            ],
          },
        },
      ],
    }),
  ],
};
```

### 消息推送

主要依赖 Web Push API + Service Worker 来实现，整个过程分为 订阅（subscribe） → 发送（push） → 接收（service worker 监听） 三个阶段。

1. 用户授权
   浏览器通过 Notification.requestPermission() 向用户请求通知权限。

```js
const permission = await Notification.requestPermission();
if (permission !== "granted") {
  alert("请允许通知权限");
  return;
}
```

2. 订阅推送服务
   使用 PushManager.subscribe() 与浏览器内置的 Push Service 建立订阅关系，并获取一个 endpoint（URL）+ 公钥信息。

```js
const subscription = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array("<VAPID_PUBLIC_KEY>"),
});
```

3. 服务端保存订阅信息
   将这个 endpoint 保存到你的数据库，用于后续发消息。

```js
await fetch("/save-subscription", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(subscription),
});
```

4. 服务端发送推送
   使用 Web Push 协议（一般通过 web-push npm 包）向浏览器 Push Service 发送加密消息。

5. 浏览器后台接收
   Service Worker 即使在网页关闭时，也能监听 push 事件，并展示通知。

```js
self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
    })
  );
});
```

## 参考文献

（1）[PWA 开发指南（一）：最简单的 PWA 入门配置](https://juejin.cn/post/7516526050408513555?searchId=20250806111824E746A71C8C886B6D0B8E)
（2）[PWA 离线方案研究报告 | 京东云技术团队](https://juejin.cn/post/7311343224546508810?searchId=20250806111824E746A71C8C886B6D0B8E)
(3)[vite pwa](https://vite-pwa-org-zh.netlify.app/guide/)
