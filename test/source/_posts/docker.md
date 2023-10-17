---
title: docker基础知识
date: 2023-03-24 17:36:32
categories:
  - 前端扩展
tags:
  - docker
excerpt: docker知识笔记
---

## 为什么选择 docker 进行部署

个人理解有以下几点：

1. docker 能提供一致性的运行环境。让程序在一致性的环境中运行：不管是开发环境、测试环境、还是生产环境；不管是开发时、构建时、还是运行时。
2. Kubernetes（又称 k8s）的容器集群管理系统因具有完备的集群管理能力（容器的高可用、负载均衡和故障恢复等）而广泛应用，为 docker 提供了自动化管理和编排的能力，让 docker 部署更容易被接受
3. 标准化的服务程序封装技术-镜像，包含了程序以及程序对运行环境的依赖

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

## 前端部署说明

目前来说，前端部署的流程可以认为是将静态文件 html、css 和 js 上传到服务器的目录下，用户通过域名+路径进行访问；如果配置了 nginx，则增加了静态文件放在 nginx 文件夹下（例如/usr/share/nginx/html/）、Nginx 启动做简单配置的操作。因为 docker 隔离性、安全性的特点，所以整个部署资源一般放在 docker 内。
实现步骤大致如下：

1. 连接服务器
   使用指令 `ssh root@[IP]`来连接远程服务器，通常需要输入用户名和密码
2. 安装 docker、拉取 nginx 的 docker 镜像
3. 增加配置文件

- 1）增加 Dockerfile：在前端项目的根目录下创建 Dockerfile，添加如下内容

```
FROM nginx  //该镜像是基于 nginx:latest 镜像而构建的
COPY dist/ /usr/share/nginx/html/  //将项目根目录下 dist 文件夹下的所有文件复制到镜像中 /usr/share/nginx/html/ 目录下
COPY default.conf /etc/nginx/conf.d/default.conf  //将 项目根目录下 default.conf 复制到 etc/nginx/conf.d/default.conf，用本地的 default.conf 配置来替换 Nginx 镜像里的默认配置
```

**备注：Dockerfile 常用指令**

- FROM：指定基础镜像，后续的指令将在该镜像上执行。
- RUN：在镜像上执行 Linux 命令，并形成一个新的层。
- CMD：指定启动镜像容器时的默认行为，一个 Dockerfile 中只能有一个 CMD 指令。
- ENTRYPOINT：指定容器启动后执行的命令，可以覆盖 CMD 指令中的命令。
- ENV：设置环境变量。
- COPY：将文件系统中的文件复制到镜像中。
- WORKDIR：设置工作目录。
- EXPOSE：设置向外暴露的端口。
- VOLUME：设置容器与外界映射的目录。

- 2）增加 nginx 的配置替换文件 default.conf。示例如下

```
server {
    listen       80;
    server_name  localhost; # 此处可修改为docker服务宿主机的ip/域名

    #charset koi8-r;
    access_log  /var/log/nginx/host.access.log  main;
    error_log  /var/log/nginx/error.log  error;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

4. 使用指令`docker build -t vue-init .`构建镜像
5. 使用指令`docker run -d -p 8136:80 --name vue-init-container vue-init`创建容器、运行。此时打开浏览器输入 服务器 ip/域名 端口号:8136，就能看到前端页面了

### 部署优化说明

以上只是部署的一个大致流程，实际公司项目的部署应该会考虑很多优化点，例如：

- 为了提升页面首屏性能，对 html 走协商缓存，css、js 走强缓存；同时采用 name-hash 的打包方式防止上线过程中资源请求错乱
- 为了减轻服务器压力，不选择将文件存储在 Nginx Web 服务器内某目录下，而是将静态资源部署到 CDN 上，再将 Nginx 上的流量转发到 CDN 上
- 。。。等等

## 参考文献

（1）[Win10 安装 Docker 以及 Jenkins(超级详细篇)](https://juejin.cn/post/7209900557712212026)
（2）[Docker 安装 Jenkins，Nginx，实现前端项目自动化构建](https://juejin.cn/post/7187326853336530981)
（3）[Docker Image Jenkins](https://github.com/jenkinsci/docker/blob/master/README.md#connecting-agents)
（4）[【前端 Docker 部署实战】Docker 镜像+Nginx 配置部署 Vue 项目](https://juejin.cn/post/6992848354753380389?searchId=202309061616378C8D0FA3A38070899341)
（5）[2021 年当我们聊前端部署时，我们在聊什么](https://juejin.cn/post/7017710911443959839)
（6）[使用 Docker 实现前端应用的标准化构建、部署和运行](https://juejin.cn/post/7269668219488354361)
