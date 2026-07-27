---
title: 腾讯云服务基础操作记录
date: 2024-02-22 22:47:26
categories:
  - 备忘录
tags:
  - k8s
  - 前端部署
---

最近因为项目迁移老要操作腾讯云服务，所以写个总结的文章，梳理一下涉及的知识和操作。说真的前端部署真的应该考虑这些吗？

<!-- more -->

## 背景知识

### Kubernetes

Kubernetes（简称 K8s）是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用程序。
Kubernetes 集群的两种管理角色：Master 和 Node。

#### 集群架构

![](/img/k8s/structure.jpg)

##### Master

集群的控制节点，每个 Kubernetes 集群需要有一个 master 节点来负责整个集群的管理和控制。包括以下结构

- Kubernetes API Server(kube-apiserver):提供了 HTTP Rest 接口的关键服务进程，是 Kubernetes 里所有资源的增，删，改，查等操作的唯一入口，也是集群控制的入口进程。
- Kubernetes Controller Manager （kube-controller-manager）:Kubernetes 里所有资源对象的自动化控制中心，可以理解为资源对象的“大总管”
- Kubernetes Schedule（kube-scheduler）:负责资源调度（Pod 调度）的进程，相当于公交公司的“调度室”。
- etcd 服务：保存 Kubernetes 里所有资源对象的数据。

##### Node

Kubernetes 集群中真正业务工作负载节点。当某个 Node 宕机后，其上的工作负载会被 Master 自动转移到其他节点上去。

- kubelet:负责 pod 对应的容器的创建，启停等任务。同时与 Master 节点密切协助，实现集群管理的基本功能。
- kube-proxy:实现 Kubernetes service 的通信与负载均衡机制的重要组件。
- Docker Engine（docker）：Docker 引擎，负责本机的容器创建和管理工作。

##### 其他

- DNS：Kubernetes 提供了内建的 DNS 服务，用于解析服务名称到 Pod IP 地址，实现服务之间的通信。
- Ingress Controller：可选组件，用于管理集群的入口流量，实现 HTTP 和 HTTPS 等应用层协议的路由和负载均衡。
- Dashboard：可选的 Web UI，用于管理和监控 Kubernetes 集群。

#### 重要概念

##### Pod

一组紧密关联的容器集合，它们共享 IPC 和 Network namespace，是 Kubernetes 调度的基本单位。在 VMware 的世界中，调度的原子单位是虚拟机（VM）；在 Docker 的 世界中，调度的原⼦单位是容器；⽽在 Kubernetes 的世界中，调度的原子单位是 Pod。每一个 pod 都有一个特殊的被称为“根容器”的 Pause 容器对应的镜像属于 Kubernetes 平台的一部分，除了 Pause 容器，每个 Pod 还包括一个或多个紧密相关的用户业务容器。

通过与 Master 节点的交互，Pod 可以被创建、调度到适合的节点上运行；而在 Node 节点上，kubelet 负责管理 Pod 的生命周期，而 kube-proxy 则负责处理 Pod 的网络通信。

##### Deployment

Pod 控制器是 Pod 启动的一种模版，用来保证在 K8S 里启动的 Pod 应始终按照用户的预期运行（副本数、生命周期、健康状态检查等）。之前主要是 Replication Controller 与 Replica Set 来实现，1.2 版本后官方更推荐用 Deployment。

Deployment 属于无状态应用部署（不会在本地存储持久化数据 ，多个 pod 间是没有关系的）。Deployment 的作用是管理和控制 Pod 和 ReplicaSet，管控它们运行在用户期望的状态中。除 Pod 管理之外，还提供了如扩缩容管理、一键回滚、不停机更新以及版本控制及其他特性。

##### Service

Pod 是非常重要的，但是可能随时会出现故障并销毁。如果通过 Deployment 或者 DaemonSet 对 Pod 进行管理，出现故障的 Pod 会自动被替换。但替换后的新 Pod 会拥有完全不同的 IP 地址。

Service 就是用来解决这个问题的核心概念，它并不是我们常说的“服务”的含义，而更像是网关层，可以看作一组提供相同服务的 Pod 的对外访问接口、流量均衡器。

##### Label

一个 Label 是一个 key=value 的键值对。其中 key 与 value 由用户自己定义。Label 可以附加到各个资源对象上，例如 Node，Pod，Service，RC 等，一个资源对象可以定义任意数量的 Label，同一个 Label 也可以被添加到任意数量的资源对象上去，Label 通常在资源对象定义时确定，也可以在对象创建后动态添加或者删除。

当给某个资源对象定义一个 Label，就相当于给它打了一个标签，然后可以通过“Label Selector”（标签选择器）查询和筛选拥有某些 Label 的资源对象

Label Selector 可以用于以下场景：

- kube-controller 进程通过资源对象 RC 上定义的 Label Selector 来筛选要监控的 Pod 副本的数量，从而实现 Pod 副本的数量始终符合预期设定的全自动控制流程。
- kube-proxy 进程通过 Service 的 Label Selector 来选择对应的 Pod，自动建立起每个 Service 到对应 Pod 的请求转发路由表，从而实现 Service 的智能负载均衡机制。
- 通过对某些 Node 定义特定的 Label，并且在 Pod 定义文件中使用 NodeSelector 这种标签调度策略，kube-scheduler 进程可以实现‘定向调度’的特性。

### 腾讯云 TKE 容器服务

腾讯云容器服务（Tencent Kubernetes Engine, TKE）基于原生 kubernetes 提供以容器为核心的、高度可扩展的高性能容器管理服务。可以帮助用户轻松地在云上部署、管理和扩展容器化应用程序（大概吧）。

目前腾讯云列出的可配置的 k8s 属性如下表格所示
![](/img/k8s/k8sObj.jpg)

### 腾讯云容器镜像服务

一种容器镜像云端托管服务。该服务支持 Docker 镜像和 Helm Chart 的存储与分发，以及镜像的安全扫描。它为企业级客户提供了细颗粒度的访问权限管理和网络访问控制，支持镜像的全球同步及触发器，以满足客户拓展全球业务及使用容器 CI/CD 工作流的需求。此外，TCR 还支持具有上千节点的大规模容器集群并发拉取 GB 级大镜像，保障业务的极速部署。

通过使用容器镜像服务，客户无需自建并维护镜像托管服务，即可在云端享受安全高效的镜像托管和分发服务。同时，该服务可以与腾讯云的容器服务 TKE 结合使用，为客户提供顺畅的容器上云体验。

## 项目部署迁移操作

### 镜像仓库迁移

公司里每个组都是有自己的命名空间的，所以项目迁移时需要在自己小组的命名空间下新建镜像仓库
![](https://qcloudimg.tencent-cloud.cn/image/document/b95228adfa9046858ad971882c800fe6.png)
在部署工具里更新镜像仓库地址，打包镜像

### 容器迁移

进入容器服务页面、选择 Deployment 菜单。在自己小组所属的命名空间下创建新的 deployment。由于部署脚手架利用了 Label 特性，所以表单的 label 一栏要增加项目的 appcode
![](/img/k8s/deployment.jpg)
容器一栏容器名可以和 deployment 保持一致；镜像选择自己小组的命名空间下新建的镜像仓库，刚新建好的镜像仓库没有版本，需要提前打包镜像推送到仓库；cpu/内存限制可以分环境考虑：

- 测试环境 cpu 限制 0.25 核，内存 256
- 正式环境 cpu 设置 0.25-0.5，内存 256-512

核心思想就是测试环境能跑就行，正式环境需要有一定的扩展性。后面实例设置也是如此。
![](/img/k8s/container.jpg)
实例数量：等同于 replicas，直接指定 pod 实例数量。测试环境可以手动限制为 1 个，正式环境选择自动调节，实例范围 2-5，触发自动调节策略根据实际情况可以设置多个，例如满足 cpu 使用率高于 50%、内存利用率高于 50%中的一个触发
![](/img/k8s/pod.jpg)
镜像访问凭证：针对镜像仓库设置的，在 pod 中指定仓库密钥，默认都配置了 qcloudregistrykey 和 tencenthubkey，如果这个 key 设置错误将导致从镜像仓库拉取私有镜像失败（一般来说之前的人已经设过了，可以看看下拉列表；不确定的时候可以删除这一栏、估计也能跑的原因是腾讯云主账号权限高吧）

### 服务迁移

![](/img/k8s/service.jpg)
服务器访问方式中，仅在集群内访问即设置 ClusterIP 的选项，服务只会在集群内部被访问，一般正式环境使用该配置（因为正式环境代码会部署到两个集群，应该是为了防止单一集群挂掉整个网站不可访问的情况吧）；内网 LB 访问即使用 ip+port 的形式可以访问到

容器端口：项目启动时的端口，一般如果是 ssr 项目就是指令启动时的端口，如果是 nginx 项目在没大改配置的条件下是 80
服务端口：自己随便设的端口，最后服务在集群外可通过负载均衡域名或 IP+服务端口访问服务

### 测试服务运行效果

点击新建的负载，查看 pod 的运行情况，如果没有正常运行，点击 tab “修正历史”查看原因。
服务设置为“仅在集群内访问”时，可以通过远程登录 pod 进行测试：点击 tab“Pod 管理“，选择一个 pod 点击远程登录，进入 cmd 界面后执行`curl <Kubernetes Service 的域名>:<服务端口>`，看返回是否是打包项目的内容
![](https://qcloudimg.tencent-cloud.cn/image/document/4b2622c6b32d982dd29c6b25eb847e10.png)

服务设置为“内网 LB 访问”时，可以直接在浏览器地址栏输入`<负载均衡IP>:<服务端口>`看打开的页面是否是打包项目的内容。负载均衡 IP 在点击新建的 Service 名称的“详情”tab 里可以看到

#### 备注

**Kubernetes Service 的域名**：在 Kubernetes 中，每个 Service 都有一个唯一的域名，该域名遵循以下格式：`<service-name>.<namespace>.svc.cluster.local`。其中：

- <service-name> 是 Service 的名称。
- <namespace> 是 Service 所属的命名空间（Namespace）。
- svc.cluster.local 是 Kubernetes 集群中所有 Service 的域名后缀。

Kubernetes Service 的域名会映射到该 Service 的 ClusterIP 地址上。当你创建一个 Service 时，Kubernetes 会为该 Service 分配一个 ClusterIP 地址，并为该 Service 自动生成一个域名，其格式为 `<service-name>.<namespace>.svc.cluster.local`。这个域名会自动解析到该 Service 的 ClusterIP 地址。

## 参考文献

（1）[kubernetes 入门看这篇就够了](https://zhuanlan.zhihu.com/p/618249568)
（2）[【云原生】K8S 超详细概述](https://blog.csdn.net/wang_dian1/article/details/132045116)
（3）[在 TKE 集群中新建工作负载](https://cloud.tencent.com/developer/article/1412208)
（4）[tke 容器服务](https://cloud.tencent.com/document/product/457/45598)
