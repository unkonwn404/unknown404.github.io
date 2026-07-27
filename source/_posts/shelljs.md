---
title: 前端使用shell指令
date: 2023-01-16 10:10:25
categories:
  - 工作技巧
tags:
  - Shell
  - node.js
---

## node.js 使用 shell 指令

### child_process

node 提供的一个子进程 API

#### 常见指令

##### child_process.spawn(command[, args][, options])

创建一个新进程来执行指令。指令执行的参数为该函数传入的第二个参数。child_process.spawn 返回 stdout 和 stderr 流对象。 程序可以通过 stdout 的 data、end 或者其他事件来获取子进程返回的数据。

示例：

```JavaScript
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

##### child_process.exec(command[, options][, callback])

创建一个 shell 执行指令。存在数据大小限制。 当子进程返回的数据超过默认大小时，程序就会产生”Error: maxBuffer exceeded”异常。

##### child_process.execFile(file[, args][, options][, callback])

同 exec 类似，但使用的是制定的文件创建进程执行。需要单独写.sh 文件，可编写复杂逻辑，但在 windows 上使用时会有兼容问题

### shelljs

基于 nodeAPI 的一个扩展，要引入插件。相比原生的 child_process 的兼容性更好，使用更灵活。
**安装指令**

```
npm install --save-dev shelljs
or
yarn add shelljs -D
```

**使用方法**

```
// 局部模式
var shell = require('shelljs');
shell.exec('git add .');
shell.exec("git commit -m 'auto-commit'")
shell.exec('git push')

// 全局模式下，就不需要用shell开头了。
require('shelljs/global');
exec('git add .');
exec("git commit -m 'auto-commit'")
exec('git push')
```

## shell 常用指令

### pwd - 显示当前目录名称

### ls - 显示目录信息

**使用参数**

-a :显示包括隐藏文件和目录在内的所有目录和文件

-l :显示文件的详细信息

-h :配合-l 以人性化的方式显示文件大小

-t :按文件最后修改时间排序文件

### cd - 目录切换

**使用示例**

```
// 返回根目录
cd
// 返回上一级目录
cd ..
// 前往当前文件夹下的某目录
cd <directory>
```

### rm - 删除文件

**使用参数**

-f :强制删除文件

-r :递归删除目录及内容

### cp - 复制文件

**指令格式**

```
cp [options] <source> <dest>
```

**使用参数**
-a :复制时保留链接、文件属性

-f :覆盖已经存在的目标文件而不给出提示

-r :若给出的源文件是一个目录文件，此时将复制该目录下所有的子目录和文件

### echo - 显示指定文本

**使用示例**

```
# 显示普通字符串
echo "hello world"

# 显示转义字符
echo "\"hello world\"" # 此时结果显示为"hello world"

# 显示变量
content="hello world"
echo "He said ${content}"

# 显示换行
echo -e "hello \n" # -e开启转义，即\n可以换行
echo "world"

# 显示结果定向至文件
echo "hello world > test"
```

### chmod - 控制用户对文件的权限

**指令格式**

1. 参数法

```
chmod [user][operator][permission] <filename>
```

**使用参数**
**user**：限定权限调整的用户范围

- u：user 表示该文件的所有者
- g：group 表示与该文件的所有者属于同一组( group )者，即用户组
- o：other 表示其它用户组
- a：all 表示这三者皆是

**operator**：权限调整内容

- +：增加权限
- -：撤销权限
- =：设定权限

**permission**：权限内容

- r：read，表示可读取，对于一个目录，如果没有 r 权限，那么就意味着不能通过 ls 查看这个目录的内容。
- w：write，表示可写入，对于一个目录，如果没有 w 权限，那么就意味着不能在目录下创建新的文件。
- x：excute，表示可执行，对于一个目录，如果没有 x 权限，那么就意味着不能通过 cd 进入这个目录。

2. 数字法

chmod 命令可以使用八进制数来指定权限。文件或目录的权限位是由 9 个权限位来控制，每三位为一组，它们分别是文件所有者（User）的读、写、执行，用户组（Group）的读、写、执行以及其它用户（Other）的读、写、执行。一组权限位中已设置时置为 1，不设置时置为 0。
以权限 rwx 为例，其对应的二进制表示为 111，即 4+2+1，也就是 7.
**使用示例**

```
# 表示所有的用户都有读写执行文件file的权利，等同于chmod a=wrx file
chmod 777 file
```

## 参考文献

（1）[Nodejs 文档](https://nodejs.org/dist/latest-v12.x/docs/api/child_process.html)
（2）[如何在 nodejs 执行 shell 指令](https://juejin.cn/post/6921734567342637070)
（3）[package.json 配置完全解读](https://juejin.cn/post/7161392772665540644)
