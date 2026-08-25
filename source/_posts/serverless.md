---
title: Serverless服务初识
date: 2026-07-27 15:00:00
categories:
  - 技术学习
tags:
  - Serverless
  - Vercel
  - Cloudflare
excerpt: 介绍 Serverless 的概念、分类（FaaS/BaaS）、常见服务（Vercel、Cloudflare 等）以及项目搭建步骤与使用约束。
---

最近在折腾博客部署和一些小工具的后端时，越来越多地接触到 Serverless 这个概念。本篇整理一下 Serverless 的基本概念、分类、常见服务以及实际项目搭建流程。

<!-- more -->

## 1. 什么是 Serverless

Serverless（无服务器）并不是真的没有服务器，而是指开发者不需要关心服务器的存在。服务器的 provisioning（配置）、扩缩容、运维等底层工作都交给云厂商来完成，开发者只需要把精力放在业务代码上。

可以把它理解成一种"按需付费、自动伸缩、无需运维"的云计算模型：

1. **按需付费**：只在代码真正执行时才计费，没有请求时不产生费用。
2. **自动伸缩**：流量大时自动扩容，流量小时自动缩容，不需要提前预估容量。
3. **无需运维**：不用管服务器装什么系统、打什么补丁，云厂商全包了。

这种模式特别适合流量波动大、团队规模小、想要快速上线的场景。

## 2. Serverless 的分类

Serverless 大致可以分成两类：FaaS 和 BaaS。

### 2.1 FaaS（Function as a Service）

FaaS 即"函数即服务"，是 Serverless 最核心的部分。开发者把业务逻辑拆成一个一个的函数，上传到云平台，由平台负责在请求到来时触发执行。

典型特征：

1. 事件驱动：函数由 HTTP 请求、定时任务、消息队列等事件触发。
2. 无状态：函数执行完即销毁，不持有长期状态，状态需要存到外部（如数据库、Redis）。
3. 短时执行：单个函数有执行时长限制（通常几秒到几分钟）。
4. 自动伸缩：平台根据并发请求数自动调度函数实例。

常见代表：AWS Lambda、Cloudflare Workers、Vercel Functions、阿里云函数计算。

### 2.2 BaaS（Backend as a Service）

BaaS 即"后端即服务"，把后端的通用能力（数据库、存储、认证、消息推送等）封装成服务，开发者直接调用 API 即可，不需要自己搭建和维护这些基础设施。

需要说明的是，BaaS 被归入 Serverless 是因为它和 FaaS 共享"无需运维、按需付费"的理念，但严格程度不如 FaaS。很多 BaaS 产品本质上是"托管服务"而非"纯 Serverless"——例如数据库可能是常驻实例而非按请求伸缩。真正能缩容到零、按用量计费的才算纯 Serverless 数据库。

典型能力：

1. 数据库服务：
   - 纯 Serverless 数据库（可缩容到零）：PlanetScale、Neon、Turso、FaunaDB。
   - 托管型 BaaS 数据库（常驻实例，但有 Serverless 特性）：Supabase（基于 PostgreSQL，免费层闲置可自动暂停，但运行时是固定实例）。
2. 对象存储：如 AWS S3、Cloudflare R2。
3. 身份认证：如 Auth0、Clerk、Supabase Auth。
4. 消息队列 / 通知：如 AWS SNS、Pusher。

以 Supabase 为例，它是一个典型的 BaaS 平台：数据库、认证、存储都是托管服务，此外还提供 Supabase Edge Functions（基于 Deno 的 FaaS，这部分是真正的 Serverless）。所以 Supabase 整体属于 BaaS，其中 Edge Functions 属于 FaaS，而数据库部分严格说是"有 Serverless 特性的托管服务"而非纯 Serverless。

实际项目中，通常是 FaaS + BaaS 配合使用：用 FaaS 写业务逻辑，用 BaaS 提供数据存储和通用能力，两者组合就是一个完整的 Serverless 应用。

## 3. 常见的 Serverless 服务

### 3.1 Vercel

Vercel 是一个面向前端开发者的 Serverless 平台，也是 Next.js 的母公司。它对前端框架（Next.js、Nuxt、Astro、SvelteKit 等）有非常好的支持。

主要能力：

1. 静态站点托管（SSG）。
2. Serverless Functions（基于 Node.js 或 Edge Runtime）。
3. 边缘网络加速（Edge Network）。
4. 自动 CI/CD，绑定 Git 仓库后 push 即部署。

适用场景：个人博客、文档站、营销页、轻量级全栈应用。

### 3.2 Cloudflare

Cloudflare 提供了多个 Serverless 产品，核心是围绕其全球边缘网络构建的：

1. **Cloudflare Workers**：基于 V8 引擎的 Serverless 函数，运行在边缘节点，延迟极低。支持 JavaScript、TypeScript、Rust（编译为 WASM）。
2. **Cloudflare Pages**：静态站点托管，支持与 Git 仓库集成自动构建，也可以配合 Workers 做动态接口。
3. **Cloudflare R2**：兼容 S3 API 的对象存储，没有出口流量费。
4. **Cloudflare D1**：基于 SQLite 的 Serverless 数据库。
5. **Cloudflare KV**：边缘键值存储，适合配置数据和会话信息。

适用场景：边缘计算、API 代理、轻量后端、全球加速的静态站点。

### 3.3 Netlify

Netlify 和 Vercel 定位类似，也是面向前端的 Serverless 平台。提供静态托管、Netlify Functions（基于 AWS Lambda）、自动 CI/CD 等能力。

### 3.4 AWS Lambda

AWS Lambda 是 FaaS 的鼻祖，功能最全面，但配置也最复杂。通常配合 API Gateway、S3、DynamoDB 等 AWS 服务一起使用。适合企业级应用和对云厂商生态依赖较深的项目。

### 3.5 阿里云函数计算 / 腾讯云 SCF

国内云厂商的 Serverless 函数服务，优势在于国内节点延迟低、备案方便、和国内云生态集成紧密。适合面向国内用户的项目。

## 4. 项目搭建步骤

下面以 Vercel 和 Cloudflare 为例，演示如何从零搭建一个 Serverless 项目。

### 4.1 Vercel 项目搭建

#### 方式一：使用框架初始化

以 Next.js 为例：

```bash
npx create-next-app@latest my-vercel-app
cd my-vercel-app
npm run dev
```

项目里默认就支持写 API Route（Serverless Function）。在 `app/api/` 目录下新建路由即可：

```
my-vercel-app/
├── app/
│   ├── api/
│   │   └── hello/
│   │       └── route.ts   # 访问 /api/hello
│   └── page.tsx
├── package.json
└── next.config.js
```

`route.ts` 示例：

```typescript
export async function GET(request: Request) {
  return Response.json({ message: 'Hello from Vercel' })
}
```

#### 方式二：纯 Serverless Functions

如果不使用框架，也可以直接在项目根目录建 `api/` 文件夹，Vercel 会自动识别为 Serverless Functions：

```
my-vercel-app/
├── api/
│   └── hello.js
├── public/
│   └── index.html
└── package.json
```

`api/hello.js`：

```javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from Vercel' })
}
```

#### 部署到 Vercel

1. 把代码推送到 GitHub / GitLab / Bitbucket。
2. 登录 [Vercel 控制台](https://vercel.com)，点击 "New Project"。
3. 导入 Git 仓库，Vercel 会自动识别框架并配置构建参数。
4. 点击 "Deploy"，等待构建完成即可访问。

也可以用 CLI 部署：

```bash
npm i -g vercel
vercel        # 预览部署
vercel --prod # 生产部署
```

如果需要自定义构建配置，可以在项目根目录添加 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/*.js": {
      "memory": 512,
      "maxDuration": 10
    }
  }
}
```

### 4.2 Cloudflare Workers 项目搭建

#### 初始化项目

使用官方脚手架 `create-cloudflare`：

```bash
npm create cloudflare@latest my-worker-app
```

按提示选择项目类型（Worker / Pages / 等），初始化完成后目录结构大致如下：

```
my-worker-app/
├── src/
│   └── index.ts
├── wrangler.toml
├── package.json
└── tsconfig.json
```

`src/index.ts` 示例：

```typescript
export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/hello') {
      return Response.json({ message: 'Hello from Cloudflare Workers' })
    }
    return new Response('Not Found', { status: 404 })
  },
}
```

#### 配置文件 wrangler.toml

`wrangler.toml` 是 Cloudflare Workers 的核心配置文件：

```toml
name = "my-worker-app"
main = "src/index.ts"
compatibility_date = "2024-09-01"

# 绑定 KV 命名空间
[[kv_namespaces]]
binding = "MY_KV"
id = "你的KV命名空间ID"

# 绑定 D1 数据库
[[d1_databases]]
binding = "MY_DB"
database_name = "my-database"
database_id = "你的数据库ID"
```

#### 本地开发与部署

本地开发：

```bash
npx wrangler dev
```

部署到生产：

```bash
npx wrangler deploy
```

### 4.3 Cloudflare Pages 项目搭建

如果是纯静态站点或前端框架项目，用 Pages 更合适：

```bash
npm create cloudflare@latest my-pages-app
# 选择 Pages 模板
```

或者在 Cloudflare 控制台直接连接 Git 仓库，配置构建命令和输出目录：

| 框架 | 构建命令 | 输出目录 |
| --- | --- | --- |
| Next.js (静态导出) | `npm run build` | `out` |
| Vite | `npm run build` | `dist` |
| Nuxt (静态) | `npm run generate` | `dist` |
| Astro | `npm run build` | `dist` |

Pages 也可以配合 Pages Functions 实现动态接口，在项目根目录建 `functions/` 文件夹即可：

```
my-pages-app/
├── functions/
│   └── api/
│       └── hello.ts
├── dist/
└── package.json
```

## 5. 使用约束与注意事项

Serverless 虽然方便，但也有不少约束，在选型时需要提前了解。

### 5.1 执行时长限制

各平台对单次函数执行时长都有上限：

| 平台 | 最大执行时长（免费 / 付费） |
| --- | --- |
| Vercel Functions | 10s / 60s（Hobby）/ 300s（Pro） |
| Cloudflare Workers | CPU 时间 10ms / 50ms（免费），无墙钟时长限制（付费） |
| AWS Lambda | 15 分钟 |
| 阿里云函数计算 | 10 分钟 |

这意味着长耗时任务（如大文件处理、视频转码）不能直接放在单个函数里，需要拆分或用其他方案。

### 5.2 冷启动

Serverless 函数在长时间没有请求后，实例会被回收，下一次请求需要重新初始化，这个过程叫"冷启动"。

冷启动的表现：

1. 首次请求延迟明显增加（几百毫秒到几秒）。
2. 语言和运行时影响较大：编译型（Go、Rust）冷启动快，解释型（Node.js、Python）稍慢，Java 最慢。
3. 包体积越大，冷启动越慢。

优化建议：

1. 精简依赖，减小打包体积。
2. 使用 Edge Runtime（如 Cloudflare Workers 基于 V8，几乎没有冷启动）。
3. 定时预热（用 cron job 周期性触发函数）。

### 5.3 内存与包大小限制

| 平台 | 内存上限 | 包大小上限 |
| --- | --- | --- |
| Vercel Functions | 1024MB（Hobby）/ 3008MB（Pro） | 250MB（解压后） |
| Cloudflare Workers | 128MB | 10MB（免费）/ 50MB（付费） |
| AWS Lambda | 10240MB | 250MB（解压后）/ 50MB（压缩） |

大内存、大依赖的场景需要特别注意。

### 5.4 无状态约束

FaaS 函数是无状态的，每次执行之间不共享内存状态。这意味着：

1. 不能依赖全局变量保存用户会话，要用外部存储（KV、Redis、数据库）。
2. 文件系统是只读的（除了 `/tmp` 临时目录），不能写入持久文件。
3. 数据库连接池要谨慎使用，因为每个函数实例是独立的，连接数可能爆炸。

### 5.5 本地开发与调试

Serverless 函数依赖云平台的环境，本地开发和线上环境可能存在差异：

1. 环境变量不同：本地用 `.env`，线上在控制台配置。
2. 运行时差异：如 Cloudflare Workers 使用 V8 而非 Node.js，部分 Node API 不可用。
3. 网络环境不同：本地直接访问，线上走边缘网络。

建议使用各平台提供的本地模拟工具（如 `wrangler dev`、`vercel dev`）来尽量还原线上环境。

### 5.6 厂商锁定

不同平台的 Serverless 接口、配置、运行时都不一样，迁移成本较高：

1. Vercel 的 API Route 和 Cloudflare Workers 的 fetch handler 写法不同。
2. 各平台的 BaaS 服务（KV、数据库等）接口不互通。
3. 部署配置文件不同（`vercel.json` vs `wrangler.toml`）。

如果担心厂商锁定，可以把业务逻辑和平台适配层分开，核心逻辑写成纯函数，再通过薄薄的适配层对接不同平台。

### 5.7 费用与额度

免费额度通常够个人项目使用，但要注意：

1. 免费额度有请求次数和执行时长的限制，超出后按量计费。
2. BaaS 服务（如数据库、存储）单独计费，容易忽略。
3. 高频请求场景下，Serverless 的费用可能比传统服务器还高。

## 6. 总结

Serverless 适合的场景：

1. 流量波动大、有明显峰谷的项目。
2. 个人项目、小团队，不想运维服务器。
3. 静态站点 + 轻量接口的组合。
4. 需要全球加速、边缘计算的场景。

不适合的场景：

1. 长连接、WebSocket 等需要持久连接的服务（虽然有部分平台已支持，但成本和复杂度较高）。
2. 重计算、长时执行的任务。
3. 对延迟极其敏感且需要精细控制的场景。

对于前端开发者来说，Vercel 和 Cloudflare 是入门 Serverless 最低门槛的两个平台，都有免费额度，文档完善，生态友好。建议从一个静态站点 + 一个简单 API 开始，逐步熟悉 Serverless 的开发模式和约束。
