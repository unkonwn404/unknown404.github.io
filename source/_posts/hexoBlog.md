---
title: hexo搭建博客
date: 2022-03-14 14:05:43
excerpt: <p>记录自己使用hexo搭建个人博客并部署到gitee的流程。</p>
categories:
  - 技术学习
tags:
  - Hexo
index_img: /img/cover.jpg
---

## 准备工具

1）[node.js](https://nodejs.org/zh-cn/)  
2) [git](https://git-scm.com/)

## 本地建站流程

1.在[Gitee](https://gitee.com/)注册登录账号，点击右上角“+”按钮创建新的仓库。仓库名可随意设置。但注意初始化时不要加文件。
![](/img/gitee-init.png)

{% note info %}
根据网上大多数博客的说法仓库名应该设置为用户名，否则 hexo 打包的 css 路径会找不到。但是实际操作中并没有遇到这样的问题推测有两个可能性。
1）这个问题只出现在 GitHub Page 开设的流程。
2）配置更新了，现在新版 hexo 的打包确保了相对路径的可查找性。
{% endnote %} 2.将空仓库拉到本地，安装 hexo，安装指令如下：

```
npm install hexo-cli -g

```

3.使用指令`hexo init`初始化 hexo，注意如果仓库的文件夹不为空的话，初始化就会失败，可以考虑新建一个文件夹，在新文件夹的位置启动初始化指令。
_（推荐将初始化生成的文件夹都放在仓库的另一个分支，master 分支保留给 hexo 打包博客文件）_
初始化后当前文件夹内部结构如下：

```
.
├── _config.yml //网站的配置文件，可配置大部分参数
├── package.json
├── scaffolds  //模版文件夹
├── source  //资源文件夹，用户添加资源的位置
|   ├── _drafts  //草稿
|   └── _posts   //博文
└── themes  //主题文件夹。Hexo 会根据主题来生成静态页面。
```

4.初始化完成以后 package.json 新增了几个指令，包括

```
"scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server"
  },
```

新增的 hexo 指令的意义是：

> hexo clean —— 清空已有 hexo 网站文件
> hexo generate(or g) —— 依据网页文本与新的 CSS 样式生成新网站文件
> hexo server(or s) —— 启动本地服务器，可以在 localhost:4000 查看网站修改效果
> 按上述顺序执行就可以在 localhost:4000 看到默认版式下的页面了。一般默认的是一个 landscape 主题。

到此为止一个简单的博客就在本地建好了。我们可以通过调整 themes 文件夹的主题、修改\_config.yml 文件来使自己的博客更加个性化。

## 更换主题

hexo 有自己的[主题网站](https://hexo.io/themes/)，可以选择自己感兴趣的主题点击进入其 github 主页进行下载，解压后添加到 themes 文件夹下。

虽然 hexo 的主题丰富，很容易找到合意的个性主题。但是第一次使用时最好找一个比较常用的模版，这样说明文档比较丰富、遇到问题网上搜索时也很容易找到答案 😭

个人比较推荐并以后打算尝试的模版包括[Next](https://github.com/theme-next/hexo-theme-next) (大家都喜欢应该是有理由的吧)、[Fluid](https://github.com/fluid-dev/hexo-theme-fluid) (文档看着真齐全)。

当前使用的主题是[tranquilpeak](https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak)，看着比较美观。后续以该主题为例讲解配置修改。

### 具体步骤

1）GitHub 网站上以 zip 方式下载
2）将解压后的文件夹命名为 tranquilpeak 添加到博客的 themes 文件夹下
3）打开博客仓库的终端进入到 tranquilpeak 文件夹位置执行`npm install && npm run prod`
4）调整博客仓库主文件夹下的`theme: tranquilpeak`
5）使用指令 hexo clean && hexo g && hexo s 即可看到新样式

### tranquilpeak 相关配置

tranquilpeak 主题文件夹下也有\_config.yml 配置文件，在我下载的当前版本 4.1.3 里，作者把配置分为了“Sidebar Configuration”、“Header configuration”、“Author“、“Customization”、“Comment systems”、“Integrated services”和“Sharing options”。
**Sidebar Configuration**：提供了侧边栏的菜单配置，可以根据自己的需求增减项目、调整链接

```
sidebar:
         menu:
             home:
                title: Home    # 链接标题
                url: /         # 链接URL
                icon: home     # Font Awesome 图标名,https://fontawesome.com/icons?d=gallery&m=free 上可以找到合适的图标
```

**Header configuration**：用于编辑头部右上角链接
**Author**：编辑作者信息，包括以下几个部分。

```
author:
    email:
    location:
    picture:
    twitter:
    google_plus:
    google_plus_business:
```

其中location和picture的填写内容会显示在关于（作者）的页面上。而作者的其他信息例如座右铭、工作等则是在博客总文件夹下的语言选项选定以后，在`tranquilpeak\languages\`下寻找对应语言的模版，修改作者相关的信息。

```
author:
    # 你的个人简介 (支持 Markdown 和 HTML 语法)
    bio: ""
    # 你的工作简介
    job: ""
```

**Customization**：有关于侧边栏的展示方法（sidebar_behavior）、文章列表缩略图位置（thumbnail_image_position）、封面图（cover_image）等配置。

“Comment systems”、“Integrated services”和“Sharing options”等配置暂时没有用到，以后再研究。

## 书写博文

1）可在终端执行如下指令完成页面新建

```
hexo new [layout] <title>
```

layout变量可以有三种选择：post、page 和 draft。在创建这三种不同类型的文件时，它们将会被保存到不同的路径；而您自定义的其他布局和 post 相同，都将储存到 source/\_posts 文件夹。
|layout选项|生成文件路径|
| :----: | :----: |
|post| source/\_posts|
|page| source|
|draft| source/\_drafts|

title是文章的名称，执行完指令后会在layout对应的路径下生成`<title>.md`文件。如果工程文件夹下的\_config.yml 文件里`post_asset_folder`这一选项置为true的话则还会生成一个title的文件夹，可以存放引用资源。

2）调整文章内容
生成的文件头部通常会包含以下内容：

```
---
title:
date:
tags:
---
```

如果是草稿则没有自动生成的date变量，执行语句`hexo publish draft  <title>`、移动到source/\_posts 文件夹时应该会出现。
根据自己的需要，可以在文件头部增加内容。以tranquilpeak为例，该样式支持categories、thumbnailImage、excerpt等配置。配置categories可以在分类页面看到自己这篇文章的归类情况；配置thumbnailImage时会在文章列表增加缩略图，但本地是看不到效果的，只有打包上传到gitee后才可以；配置excerpt时首页文章列表不会展示全文而只会展示摘要。
tranquilpeak模版还支持两个标签语法：`<!-- more -->`和``。前者是将标志之前的内容将会自动生成首页的概览，后者则是自动生成文章目录。
具体的内容书写可以参考markdown语法。

## 推送到gitee

1）首先需要安装推送工具hexo-deployer-git。

```
npm install hexo-deployer-git --save
```

2）在博客工程文件夹下的\_config.yml找到URL和deploy的配置。

```
# URL
## Set your site url here. For example, if you use GitHub Page, set url as 'https://username.github.io/project'
url: https://unknown-four-hundred-and-four.gitee.io/unknown_404

...

deploy:
  type: git
  repository: https://gitee.com/unknown-four-hundred-and-four/unknown_404.git
  branch: master
```

这里URL需要改成静态资源最后部署的域名，按照配置文件的说明，应该是`https://{username}.github.io/{project}`的格式，username是GitHub用户名，在GitHub上仓库名和用户名是相同，但在gitee上可以不一样，所以要注意实际上需要填入的是仓库名。project对应当前博客的工程名。
deploy选项里repository对应博客仓库的git地址，branch可根据需要修改，部署到page时注意一致性即可。
3）文件生成成功后执行`hexo deploy`指令，将文件推到远程仓库的master分支上。
![](/img/gitee-master.png)

## gitee page服务启动

1）在gitee仓库首页选择“服务-Gitee Page”
![](/img/gitee-page.png)

2）如果没有实名认证的话开启Page服务需要验证，还需要绑定手机号。
3）进入到Gitee Pages 服务页面，选择部署分支，注意和工程文件夹下的\_config.yml的deploy配置一致，如果选择了强制使用https，则工程文件夹下\_config.yml的url配置也必须是https。
![](/img/gitee-start.png)

## 其他客户端拉取代码的注意事项

本博客使用的主题tranquilpeak其资源assets是被列入忽略文件夹的内容，因此拉下来的代码不会包括这部分资源，如果直接启动无法正常看到页面样式。需要使用者在拉取代码以后进入主题的文件夹下按要求操作`npm install && npm run prod`才可在本地看到正常的样式。如果之前将头像等资源放在assets文件夹下的话也需要在新生成的assets文件夹下重新加入。

## vercel部署改造

由于博客后来同时需要部署到 GitHub Pages 和 Vercel，而两边的静态资源根路径并不一致，所以不能继续只保留一份写死的 `url` 配置。GitHub Pages 项目页通常需要带上仓库名作为子路径，例如 `/unknown404.github.io/`；但 Vercel 部署在站点根路径时，如果生成结果里仍然带着这个前缀，就会出现部分 js、css 资源无法正常加载的问题。

改造思路是将通用配置和平台差异配置拆开处理。基础配置文件`\_config.yml`中只保留通用内容，并将 `root` 调整为 `/`。然后新增 `\_config.github.yml`，专门用于覆盖 GitHub Pages 的 `url`、`root` 和 `deploy` 配置；再新增 `\_config.vercel.yml`，用于 Vercel 场景下覆盖根路径配置。这样可以避免一份配置同时兼顾两种部署方式时相互影响。

`package.json` 里增加了两套命令：

```
"build:github": "hexo clean && hexo generate --config _config.yml,_config.github.yml",
"build:vercel": "node tools/build-vercel.cjs",
"deploy": "hexo clean && hexo deploy --generate --config _config.yml,_config.github.yml"
```

其中 `deploy` 和 `build:github` 仍然服务于 GitHub Pages，生成结果中的资源路径会保留仓库子路径；`build:vercel` 则会在构建时动态写入当前站点地址，并使用 `/` 作为根路径生成静态文件，从而保证 Vercel 页面可以正常加载样式和脚本资源。

为了让 Vercel 直接从仓库根目录完成构建，还可以在根目录增加 `vercel.json`：

```
{
  "installCommand": "cd test && npm install --no-package-lock --registry=https://registry.npmjs.org",
  "buildCommand": "cd test && npm run build:vercel",
  "outputDirectory": "test/public"
}
```

这里之所以没有直接沿用旧的 `package-lock.json`，是因为旧锁文件版本较低，而且其中部分依赖地址来自历史私有源，放到 Vercel 的构建环境中可能出现安装失败的情况。因此临时改为忽略锁文件并从 npm 官方源安装依赖。如果后续重新生成新的锁文件并提交仓库，则可以再把安装命令恢复为普通的 `npm install`。

实际使用时，本地如果需要部署到 GitHub Pages，可以进入博客目录执行 `npm run deploy`；如果需要验证 Vercel 产物，则执行 `npm run build:vercel`。经过这次拆分后，两套平台的部署结果可以分别适配，不会再因为路径前缀不同而导致资源引用异常。

## 参考资料

（1）[基于Gitee+Hexo搭建个人博客](https://cungudafa.blog.csdn.net/article/details/104260494?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ELandingCtr%7ERate-1.queryctrv4&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ELandingCtr%7ERate-1.queryctrv4&utm_relevant_index=1)
（2）[Hexo中文文档](https://hexo.io/zh-cn/docs/writing)
（3）[tranquilpeak配置](https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak/blob/master/DOCUMENTATION.md)
