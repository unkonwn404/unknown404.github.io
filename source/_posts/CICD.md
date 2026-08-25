---
title: CI/CD初识
date: 2024-04-11 21:07:01
categories:
  - 技术学习
tags:
  - CI/CD
  - 运维小知识
---

## CI/CD 简介

CI 代表持续集成（Continuous Integration），在持续集成中，开发人员通常会将其代码提交到共享存储库，并且在每次提交后，会自动触发一系列的构建、测试和验证流程。

CD 代表持续交付（Continuous Delivery）和持续部署（Continuous Deployment）。持续交付是指自动化地将软件构建、测试和部署到预生产环境的过程，使得软件可以随时准备好进行发布。而持续部署更进一步，是指将软件构建、测试和部署的过程完全自动化，包括将新代码直接部署到生产环境，以便快速交付新功能和修复 bug。

## 常见 CI/CD 工具

### Jenkins

该软件提供了一个易于使用的 Web 界面，可以帮助开发团队快速、高效地构建、测试和交付软件。它与各种版本控制系统（如 Git、Subversion）和构建工具（如 Maven、Gradle）无缝集成，可以轻松地配置和管理项目的构建过程。
Jenkins打包部署的配置大致包括以下几步：

1. 创建 Job（新建任务）
   点击左侧 'New Item'，输入项目名称，类型建议选择 'Freestyle project'（自由风格，适合新手）或 'Pipeline'（如果想用脚本化流程，更灵活但学习成本高一些）。刚上手建议先用 Freestyle project。
2. 配置源码管理（Source Code Management）
   在任务配置页找到 'Source Code Management'，选择 Git，填入你的仓库地址（如 https://github.com/xxx/xxx.git），如果是私有仓库需要点 'Add' 添加凭据（用户名密码或 SSH Key/Token）。分支默认填 _/main 或 _/master，看你实际分支名。
3. 配置构建触发器（Build Triggers）
   可选：如果希望代码 push 后自动构建，勾选 'GitHub hook trigger for GITScm polling'（需要在 GitHub 仓库设置 Webhook 指向 Jenkins）；如果不想用 webhook，可以选 'Poll SCM' 定时轮询，比如填 H/5 \* \* \* \* 表示每5分钟检查一次代码变化。也可以先不配置，纯手动点击构建。
4. 配置构建步骤 - 前端
   在 'Build Steps' 里点 'Add build step' -> 'Execute shell'（Linux/Mac）或 'Execute Windows batch command'（Windows）。写入前端构建命令，例如：cd frontend && npm install && npm run build。构建产物通常会生成在 dist 或 build 目录。
5. 配置构建步骤 - 后端
   再添加一个 'Execute shell' 步骤，写入后端命令，比如 Java 项目：cd backend && mvn clean package；或 Node 项目：cd backend && npm install && pm2 restart app；根据你的技术栈调整命令。（如果前端打包内容需要后端管理，pm2 侧配置可以在ecosystem.config.cjs增加一个 app -web配置，起用 pm2 内置静态服务器（script: 'serve'），部署机不需要额外安装 serve npm 包）
6. 配置部署/发布（可选）
   如果需要自动部署，可以再加一个 shell 步骤，把构建产物拷贝到目标目录或用 scp/rsync 传到服务器，再重启服务（如 systemctl restart xxx 或 pm2 restart xxx）。也可以用 Jenkins 插件如 'Publish Over SSH' 来简化远程部署。
7. 保存并执行首次构建
   点击页面下方 'Save' 保存配置，回到项目主页点击左侧 'Build Now'（构建现在）触发第一次构建，可以在 'Build History' 里点进去看 'Console Output' 控制台日志，排查是否报错。

### gitlab

#### gitlab runner 启动

gitlab runner 是一个开源项目，用于运行流水线任务并将结果发送回 GitLab。本质就是一个服务器。

gitlab-runner 的三种类型：

- 共享 Runner（Shared Runner），所有项目可以使用。
- 群组 Runner（Group Runner），特定群组里的所有项目和子群组。
- 特定 Runner（Specific Runner），用于独立的项目。

##### gitlab runner 安装

可以在任意一台 server 安装。首先添加 GitLab 官方源

```
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.rpm.sh | sudo bash

sudo yum install gitlab-ci-multi-runner
```

##### gitlab runner 注册

安装完 gitlab-renner 并成功运行后，我们此时需要将 gitlab 和 gitlab-runner 之间产生关联，所以我们需要注册 runner 到 gitlab

点击 gitlab 仓库的 setting，选择 CI/CD 的选项，runner 一栏可以看到注册 runner 需要的 url 和 token。在执行下列指令时需要把 url 和 token 的参数换成自己 gitlab 仓库的

```
gitlab-runner register \
--non-interactive \
--executor "docker" \
--docker-image alpine:latest \
--url "http://gitlab.xxxx.com:9880/" \
--registration-token "i-WPBnBbQtiQDYndpQkc" \
--description "my first nine-runner" \
--tag-list "nine-runner" \
--run-untagged \
--locked="false"
```

成功注册的话我们就可以在 gitlab 的 runner 一栏看到它的基本信息

#### .gitlab-ci.yml

位于项目代码仓库的根目录下的配置文件，该文件中可以指定代码扫描、构建、测试、部署等几个步骤的一系列的命令或者脚本。
以前端项目举例，配置文件最基础的情况也需包括以下几步

- npm install 安装依赖
- npm run build 打包项目
- 将生成的 dist 文件打包目录部署

```
stages:
  - build

build:
  stage: build
  only:
    - test
  cache:
    key: "cache"
    paths:
      - node_modules/
  script:
    - npm install
    - node publish
  tags:
    - front-end
```

以上面这个代码为例，这里设置了流水线的阶段只有 build，而任务名 build 就是会在该阶段执行的任务，代码会先后执行指令`npm install` 和`node publish`。
但实际 devops 设计中，可能不会把构建部署任务放在该文件内，一是为例防止开发人员随便乱改这个文件，二是篇幅过长看着很乱，不易于统一更新维护。

所以有些 devops 会利用模板拆分优化.gitlab-ci.yml。这时候开发代码根目录下的 .gitlab-ci.yml 文件如下：

```
variables:
  BUILD_TYPE: JAVA

include:
  - project: 'Group1/gitlab-ci-template'
    ref: 'master'
    file: 'src/.gitlab-ci-template.yml'
```

我们模板仓库在 Group1 这个组下的 gitlab-ci-template 目录，其中包含一个 src 目录，src 目录下包含一个 .gitlab-ci-template.yml 文件，里面就包含流水线任务配置。
这样就可以有效解决上述问题。

## 前端部署

### ng 部署

前端最常见的传统部署方式：

1. 打包生成 dist/ 目录。
2. 拷贝到服务器（常用 scp、rsync、CI/CD 流水线）。
3. 服务器上安装 Nginx，配置 nginx.conf，托管静态资源。

这种方式需要手动配置服务器，更新时也要手动做文件替换。涉及到服务器层次的知识比较多，对前端不友好。

### 容器化部署

容器化部署就是把应用及其运行所需的环境（依赖、配置、系统库等）打包到一个独立可移植的容器镜像中，然后通过容器运行。
这样做的好处是依赖库和环境一起打包成一个镜像，不会再受到宿主机环境配置的影响。

```dockerFile
# 使用基础的Node.js镜像
FROM node:18.16.0

# 设置工作目录
ARG DIR=/opt/apps/static
RUN mkdir -p $DIR
WORKDIR $DIR

# 复制项目文件到工作目录
COPY . $DIR

# 安装项目依赖
RUN yarn

# 构建项目
ENV NODE_ENV production
RUN yarn build


# 上传CDN静态资源（指令涉及的node文件得自己设置）
RUN yarn upload

# 安装ng镜像
RUN apk add --no-cache curl nginx

# 运行ng
CMD ['nginx']
```

以上面这个镜像文件为例，打包镜像需要经历的操作包括：

1. 拉取一个 Node:18.16.0 的镜像包, 你的业务代码都会在 Node:18.16.0 的环境中运行
2. 创建一个工作区,他可以是任何名字，复制文件到工作目录
3. yarn 根据 package.json 安装依赖
4. yarn build 打包项目
5. 上传静态资源到 CDN，虽然不上传也不会有什么影响，但是会导致已经打开页面的用户（单页应用），在没有刷新的情况下继续操作界面，会出现一些资源 404 的问题。这是因为旧镜像已销毁，index 请求的 js、css 资源都无法访问了。（当然前端项目的生产配置需要将静态资源路径设置成 cdn 链接格式）
6. 安装 ng、启动 ng。如果需要配置 ng，可以把 ng.conf 文件放到前端项目，用指令例如`nginx -c /opt/apps/static/ng.conf`指定

PS：静态资源上传还有个好处，就是假设该页面是在某个域名的路径下才能访问、不会出现 index.html 的相对路径无法访问对应资源的问题，因为如果是域名的 ng 配置了特殊路径指向项目，index 访问资源的路径就变成了`域名+相对路径`，肯定是找不到的。

## 参考文献

（1）[如何从零开始搭建 CI/CD 流水线](https://www.infoq.cn/article/WHt0wFMDRrBU-dtkh1Xp/)
（2）[gitlab document](https://docs.gitlab.com/ee/ci/yaml/#includeproject)
（3）[Gitlab CI/CD 浅谈模板拆分](https://zhuanlan.zhihu.com/p/453140826)
（4）[GitLabCI 模板库的流水线优化实践](https://cloud.tencent.com/developer/article/1925580)
（5）[面向个人开发者应该打造的 CICD 部署系统](https://juejin.cn/post/7137143919418015751?searchId=20240407153905A10825B44CD86F030868#heading-20)
（6）[用 Docker 容器技术部署前端项目(React/Vue)](https://juejin.cn/post/7248909699960193061)
（7）[前端容器化部署——解决重启容器时的静态资源丢失问题](https://juejin.cn/post/7401144423562117172?searchId=202508201609479E8CAA60ADF98C704E06)
