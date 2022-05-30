---
title: git指令回顾
date: 2022-04-27 17:55:23
categories:
  - 技术学习
tags:
  - git
---
最近VsCode图形化界面操作太过于习惯，一些git指令操作感觉有点生疏，所以回顾一下。
<!-- more --> 
进入正题前可配合以下VsCode操作文章一起阅读，体会也许更深：
1）[VS Code使用Git可视化管理源代码详细教程](https://cloud.tencent.com/developer/article/1793472)
2）[Version Controlling with Git in Visual Studio Code and Azure DevOps](https://almvm.devopshub.cn/labs/azuredevops/git/)
虽说界面化是挺好的，但万一哪天需要书写或修改部署文件时会比较头疼，所以还是要记录一点
<!-- toc -->
## 背景
git是一个分布式版本控制软件。其工作流程如下图所示：
{% image center clear git.jpeg  %}

涉及的基本工作区概念有：
**Workspace**：工作区，平时开发时改动的地方
**Index**：暂存区，执行`git add`指令后工作区的文件修改内容就会被推到暂存区
**Repository**：本地仓库，位于自己的本地电脑，执行`git commit`指令后暂存区的文件修改内容就会被推到本地仓库
**Remote**：远程仓库，用来托管代码的服务器，比较常见的包括GitHub、Gitee、GitLab，可以被多个处于协作的本地仓库修改，执行`git push`指令后本地仓库的文件修改内容就会被推到远程仓库

一般来说git的开发流程主要包括以下步骤：
1. 使用`git clone`将远程仓库代码拉到本地
2. 按照业务从master分支拉取新分支、使用`git branch <branch-name> `、`git checkout <branch-name> `在新分支上进行开发
3. 本地开发完成使用`git add .`添加所有修改到暂存区
4. 使用`git commit -m <message>`将修改提交到本地仓库
5. 使用`git push`将修改推送到远程仓库

## git常用配置
### 全局配置用户名、用户邮箱
```
git config --global user.name "xxx"
git config --global user.email "xxx@xx.com"
```

### 配置SSH Key
SSH Key允许本地电脑和远程仓库间建立一个安全链接。和 https 拉取远程代码的不同点是，https 方式需要手动输入用户名和密码，ssh 的方式配置完毕后 Git 都会使用你本地的私钥和远程仓库的公钥进行验证是否是一对秘钥，从而简化了操作流程。
#### 查看SSH Key
Windows终端可输入如下指令：
```
type %userprofile%\.ssh\id_rsa.pub
```

GNU/Linux/Mac/PowerShell则可以使用该指令：
```
cat ~/.ssh/id_rsa.pub
```
如果返回开头为`ssh-rsa`一长串字符，可以跳过生成SSH Key过程
#### 生成SSH Key
使用指令：
```
ssh-keygen -t rsa -C "xxx@xxx.com"
```
后续关于文件名、passphrase的设置最好直接回车采用默认值，以免影响自动调用SSH Key的流程。
如果之后需要修改key值，可以使用如下语句：
```
ssh-keygen -p <keyname>
```
完成后再使用如下指令查看SSH Key：
Windows：
```
type %userprofile%\.ssh\id_rsa.pub
```

GNU/Linux/Mac/PowerShell：
```
cat ~/.ssh/id_rsa.pub
```
#### 复制SSH Key
Windows 命令:
```
type %userprofile%\.ssh\id_rsa.pub | clip
```

Windows PowerShell:
```
cat ~/.ssh/id_rsa.pub | clip
```

Mac:
```
pbcopy < ~/.ssh/id_rsa.pub
```

GNU/Linux (需要 xclip):
```
xclip -sel clip < ~/.ssh/id_rsa.pub
```
#### 添加SSH Key
打开gitlab，在左侧栏找到profile setting，点击SSH Keys，将复制的SSH Key内容粘贴在keys一栏，点击`add key`完成。

### 查看git配置
使用指令`git config --list`可以查看当前配置所有项

## 工作区常用git指令
### 新建本地仓库
#### 本地项目git管理
使用指令`git init`使项目git化
#### 远程仓库项目本地操作
使用指令`git clone <url>`，例如 `git clone git@gitee.com:unknown-four-hundred-and-four/unknown_404.git`。这里的url最好用SSH而非HTTPS，避免手动输入用户名和密码的麻烦。
在克隆完每个远程仓库后，远程仓库默认为origin。如果想用其他的主机名，需要用git clone命令的-o选项指定。
```
git clone -o jQuery https://github.com/jquery/jquery.git
```

### 开发新业务
#### 查看当前仓库分支情况
```
git branch 查看本地仓库分支情况，*表示当前位于的分支
git branch -a 查看本地和远程所有分支情况
```
#### 创建业务分支开发
使用指令`git checkout -b <branchname>`使工作区切到新建的分支上。该指令是`git branch <branchname>`和`git checkout <branchname>`合在一起的结果。
#### 代码提交
1）使用指令`git add`将代码提交到暂存区。
```
// 添加某个文件到暂存区，后面可以跟多个文件，以空格区分
git add xxx
// 添加当前更改的所有文件到暂存区。
git add .
```

2）使用指令`git commit`将代码提交到本地仓库。
```
// 提交暂存的更改，会新开编辑器进行编辑
git commit 
// 提交暂存的更改，并记录下备注
git commit -m "you message"
// 等同于 git add . && git commit -m
git commit -am
// 对最近一次的提交的信息进行修改,此操作会修改commit的hash值
git commit --amend
```
#### 提交规范补充
commit的内容规范不应该被轻视，一个调理清晰的commit记录有助于后面的人做维护工作。实际工作中可能常会遇到之前项目下掉的某功能需要重新恢复，如果能有清晰的commit说明维护人员就能很快定位功能代码位置做出调整；而如果提交记录只有类似fix 、bugfix的说明则会给维护工作造成麻烦。

目前广泛接受的commit格式规范是angular团队规范，它的message格式如下：
```
<type>(<scope>): <subject>// header部分
<BLANK LINE>// 空行
<body>// body部分
<BLANK LINE>// 空行
<footer>// 注释footer部分
```
主要分为三个部分：
##### header部分
必填内容, 描述主要修改类型和内容。规范将 header 分为 type、scope、subject 三部分。
**type**：提交的代码修改所属类型，必填项。应在以下几种中选择一种：

* feat: 一项新功能
* fix: 一个错误修复
* docs: 仅文档更改
* style: 不影响代码含义的更改（空白，格式，缺少分号等）
* refactor: 既不修正错误也不增加功能的代码更改（重构）
* perf: 改进性能的代码更改
* test: 添加缺失或更正现有测试
* build: 影响构建系统或外部依赖项的更改（gulp，npm等）
* ci: 对CI配置文件和脚本的更改
* chore: 更改构建过程或辅助工具和库，例如文档生成

**scope**：本次提交的影响范围，描述提交更改的位置如模块名或文件名。可选项
**subject**：指本次提交的简要描述。
##### body部分
选填部分。
##### footer部分
主要备注以下内容：
- **BREAKING CHANGE**：当前修改是否发生了版本升级、接口参数减少、接口删除、迁移等破坏性调整。
- **关闭Issue**：填写格式`Closes #ISSUE_ID, #ISSUE_ID` 

当前使用比较广泛的规范化工具是[commitizen](https://www.npmjs.com/package/cz-conventional-changelog)。

3）使用指令`git push`将代码提交到远程仓库。
```
git push <远程主机名> <本地分支名>:<远程分支名>
```
如果省略远程分支名，则会将本地分支推送到对应名称的远程分支（两者有追踪关系），如果该远程分支不存在，则会被新建。
如果省略本地分支名，则是将空分支推到远程分支，等同于删除指定的远程分支。
如果省略本地分支和远程分支、且当前分支与远程分支之间存在追踪关系时，将当前分支推送到origin主机的对应分支；如果追踪关系只有一个可以直接`git push`。
#### 文件暂存
有的时候我们的功能开发了一半，因为某些原因我们需要 checkout 到其他的分支上查看代码或者是执行某个工作。这个时候由于功能并没有开发完成，所以并不希望提交代码，此时可以用`git stash`指令来将本地还没有提交的改动全部存储起来。
```
// 保存改动并注释本次改动
git stash [save] <message>
// 将新创建并且还没有被 git 管理的文件也一并储藏起来
git stash  [--include-untracked/-u]
// 查看全部存储记录
git stash list
// 恢复，num是可选项，通过git stash list可查看具体值。只能恢复一次
git stash pop stash@{num}
//恢复，num是可选项，通过git stash list可查看具体值。能恢复多次
git stash apply stash@{num}

```
git stash在没有add之前才能执行。
#### 业务协作
当同事开发的内容和自己在同一分支且对方已经提交代码的情况下，可以使用指令git pull，git pull 等同于 git fetch && git merge
```
// 拉取远程分支代码的更新,对当前工作区的代码没有影响
git fetch <远程主机名(eg. origin)> <分支名>
// 将当前分支与指定分支进行合并
git merge <分支名>
// 从远程仓库拉取代码并合并到本地
git pull <远程主机名> <远程分支名>:<本地分支名>
```
##### 辨析：git merge和git rebase的区别
相同点：两个指令都可以用于分支合并。
不同点：
1）提交记录里，merge在非快速模式下会多一条Merge branch 'xxx' into 'xxx'的提交信息，而rebase不会
2）合并冲突时，merge只需要处理一次冲突，rebase需要解决一次又一次冲突
3）rebase的交互模式可以将多次提交压缩成一次，具体步骤是：
- a）执行指令`git rebase -i <base-commit>`，参数base-commit就是指明操作的基点提交对象，基于这个基点进行 rebase 的操作
- b）指令结束后会进入一个 vim 的交互式页面，将基点以后的节点都设置为了pick，且后面会有指令提示，常用的指令包括
```
pick：使用该次提交
squash：将该commit和前一个commit合并
```
通常将第一个提交的后面的pick改成squash即可。
- c）保存，退出编辑页面（点击Esc键后输入:wq），进入commit message页面。之后同样是输入i进入编辑界面，修改自己的commit message
- d）保存，退出。至此，git rebase一个流程走完。
> 特别注意，只能在自己使用的 feature 分支上进行 rebase 操作，不允许在集成分支上进行 rebase，因为这种操作会修改集成分支的历史记录。
#### 部分需求交付
在开发新功能时因各种客观原因赶不上交付期限的時候，可能需要交付部分需求。针对这一情境，有两种指令可以解决具体的问题。
- 1）git cherry-pick
使用格式：
```
git cherry-pick <commit-id>
```
commit-id为某次提交的hash值。该指令可以理解为”挑拣”提交，和 merge 合并一个分支的所有提交不同的是，它会获取某一个分支的单次提交，并作为一个新的提交引入到你当前分支上。

当新需求分支里的bug修复代码要提前于需求上线时，可以使用git cherry-pick将feature分支上bug修复那次提交生成的hash码提取出来作为一个新的提交加在master分支上。过程中，如果出现冲突，需要解决冲突、之后进行 git add ，接着执行 git cherry-pick --continue。

如果存在多个提交需要同步到目标分支，可以简写为 `git cherry-pick <first-commit-id>...<last-commit-id>`，这是一个左开右闭的区间，也就时说 first-commit-id 提交带来的代码的改动不会被合并过去，如果需要合并过去，可以使用` git cherry-pick <first-commit-id>^...<last-commit-id>`。

- 2）git revert
使用格式：
```
git revert <commit-id>
```
commit-id为某次提交的hash值。该指令会创建一个新的提交来去除指定的某次commit的内容。

当新需求中某一项功能因为种种原因不能上线时可以使用该指令。这样既可以留下记录又不会导致其他人分支不同步。
## 参考资料
（1）[commit规范+commitlint+CHANGELOG自动生成一条龙服务](https://juejin.cn/post/6934292467160514567#heading-0)
（2）[git rebase -i 合并多次提交](https://blog.csdn.net/M__L__/article/details/104573220)
（3）[多年 Git 使用心得 & 常见问题整理](https://juejin.cn/post/6844904191203213326)
（4）[我在工作中是如何使用 git 的](https://juejin.cn/post/6974184935804534815)
（5）[DAY11-git cherry-pick和revert](https://ithelp.ithome.com.tw/articles/10244481)