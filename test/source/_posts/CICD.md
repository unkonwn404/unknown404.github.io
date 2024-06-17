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

## 参考文献

（1）[如何从零开始搭建 CI/CD 流水线](https://www.infoq.cn/article/WHt0wFMDRrBU-dtkh1Xp/)
（2）[gitlab document](https://docs.gitlab.com/ee/ci/yaml/#includeproject)
（3）[Gitlab CI/CD 浅谈模板拆分](https://zhuanlan.zhihu.com/p/453140826)
（4）[GitLabCI 模板库的流水线优化实践](https://cloud.tencent.com/developer/article/1925580)
（5）[面向个人开发者应该打造的 CICD 部署系统](https://juejin.cn/post/7137143919418015751?searchId=20240407153905A10825B44CD86F030868#heading-20)
