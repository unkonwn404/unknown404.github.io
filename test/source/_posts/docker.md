---
title: docker基础知识
date: 2023-03-24 17:36:32
categories:
  - 前端扩展
tags:
  - docker
excerpt: docker知识笔记
---

## 基本概念

- Client：客户端
- Daemon：守护进程
- Image：镜像，一个容器的模板，通过一个镜像可以创建多个容器
- Container：容器，是镜像的运行实例
- Repository：仓库，分为公开仓库（Public）和私有仓库（Private）两种形式。最大的公开仓库是 Docker Hub， 存放了数量庞大的镜像供用户下载。私有仓库是指用户在本地搭建的私有 Docker Registry。

Client 通过命令行与 Daemon 交互。Daemon 通过 Image 镜像创建了一个容器去运行命令。

## docker 安装

Mac 电脑如果没有安装 homebrew，可以通过 [Docker Desktop](https://www.docker.com/get-started/)下载 docker 后，双击安装即可。

安装完成后可以使用指令`docker -v`查看 docker 版本号，确认是否安装成功。

## docker 常见指令

### 容器相关指令

```
# 查看运行中的容器
# 可以查看容器ID、基础镜像、容器名称、运行状态、端口映射等
docker ps

# 查看所有容器：包括停止的
docker ps -a

# 查看容器的信息
# 例如端口号的映射、目录挂载
docker inspect [images_name/images_id]

# 启动和停止容器
docker start/stop [container_name/container_id]

#  重启容器
#  使用场景实例：
#  在加入新的npm包依赖需要重新编译的时候使用重启运行编译
#  nginx容器的配置更新后需要重启生效
docker restart [container_name/container_id]

# 进入容器
# ps:有些容器没有bash,需要改成/bin/sh，例如mysql、mongodb的
# 退出容器输入exit 回车键
docker exec -it [container_name/container_id] /bin/bash

# 删除容器
# 在容器停止的状态才能删
docker rm [container_name/container_id]

# 容器主机文件拷
# 将容器文件拷贝到主机
docker cp [container_id/container_name] : [文件目录] [主机目录]

# 将主机的目录拷贝到容器
docker cp [主机目录] [container_id/container_name] : [文件目录]
```

### 镜像相关指令

```
# 搜索镜像
docker search [images_name:tag]

# 下载镜像（：指定版本）
docker pull [images_name:tag]

# 查看本地下载的镜像
docker images

# 自己构建镜像
# 根据dockerfile的路径或者url构建镜像
docker build [OPTIONS] PATH|URL|-

# 查看镜像的构建历史
docker history [images_name]

# 删除镜像
# 需要先删除以此镜像为基础的容器
docker rmi [images_name]

# 运行镜像
## 
docker run [OPTIONS] [images_name] [COMMAND] [ARG...]
```

### 镜像迁移相关

#### docker save + docker load

docker save 命令用于将 Docker 镜像导出为一个 tar 归档文件，该文件包含了镜像的全部文件系统层，包括 Dockerfile 中定义的命令、环境变量等。导出的镜像可以使用 docker load 命令重新导入到 Docker 中，或者将其传输到其他 Docker 安装实例中。由于 docker save 导出的文件包含了完整的镜像层，因此可以用来备份或迁移整个镜像。

#### docker export + docker import

docker export 命令用于将 Docker 容器的文件系统导出为一个 tar 归档文件，该文件不包含容器的元数据（比如容器的标签、端口号、环境变量等），仅包含容器中运行的应用程序和文件。导出的容器文件系统可以使用 docker import 命令导入为一个新的 Docker 镜像，或者在需要时手动将其中的文件复制到本地系统中。由于 docker export 不包含镜像的元数据，因此它通常用于容器的临时备份和文件传输。

总之，docker save 适用于备份、迁移整个 Docker 镜像，docker export 适用于容器的临时备份和文件传输。

## docker 镜像运行实践：Jenkins 安装

### Jenkins 简介

Jenkins 是一款业界流行的开源持续集成工具，广泛用于项目开发，具有自动化构建、测试和部署等功能。前端自动化部署的重要工具。

### Jenkins 镜像获取

dockerHub 网站已经提供了对应的镜像[jenkins](https://hub.docker.com/r/jenkins/jenkins)。个人理解 dockerHub 网站类似依赖包的一个集合网站 npmjs，而镜像则类似于依赖包。开发者可以从 dockerHub 下载需要的镜像，也可以把自己生成的镜像打包上传到网站。在运行类似 docker run 等指令时如果镜像不存在当前 docker 内就会去网站拉取同名镜像。
执行指令`docker pull jenkins/jenkins:lts-jdk11`就可以下载 Jenkins 的稳定镜像版本。

### Jenkins 容器创建

执行如下指令，在 docker volume 会自动产生一个叫 jenkins_home 的空间，无论 docker 的容器是运行还是停止或删除 jenkins_home 都会存在；同时指令还做了端口的映射：将宿主机 8080 端口映射到容器 8080 端口，50000 端口是基于 JNLP 的 Jenkins 代理（slave）通过 TCP 与 Jenkins master 进行通信的端口。

```
docker run -p 8080:8080 -p 50000:50000 --restart=on-failure -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts-jdk11
```

执行完后可以用指令 docker ps 查看容器运行情况。运行完成就可以在本地打开网址 http://localhost:8080 即可访问。
正常运行时应该可以看到一个登录界面，需要输入管理员密码才可正常进入，该密码在命令行中可以看到。但有时可能会遇到"Please wait while Jenkins is getting ready to work"，需要重启 container 才能完成，原因不明。

## 参考文献

（1）[Win10 安装 Docker 以及 Jenkins(超级详细篇)](https://juejin.cn/post/7209900557712212026)
（2）[Docker 安装 Jenkins，Nginx，实现前端项目自动化构建](https://juejin.cn/post/7187326853336530981)
（3）[Docker Image Jenkins](https://github.com/jenkinsci/docker/blob/master/README.md#connecting-agents)
