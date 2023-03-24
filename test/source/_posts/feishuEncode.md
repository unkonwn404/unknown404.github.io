---
title: 飞书机器人验证实现
date: 2023-03-15 17:46:58
categories:
  - 工作技巧
tags:
  - node.js
---

因工作需要设计了一个调用飞书机器人的接口，主要的实现点在于 webHook 的验证通过。

<!-- more -->

```js
// 引入加密模块crypto
const crypto = require('crypto')
function sendMsg({url,secret}){
    const {ctx} = this;
    let dataBody={
        msg_type: "text",
        content: {
            text: 'test'
        }
    }
    // 加密。时间戳单位是s
    const timestamp = parseInt(new Date().getTime() / 1000 + '') + '';
    // 存储到buffer时说明数据类型
    const stringify = Buffer.from(`${timestamp}\n${secret}`, 'utf8');
    // sha256加密
    const shasign = crypto.createHmac('SHA256', stringify);
    // 只有调用update后才能通过调用 digest() 方法来生成加密结果，update内部传入的参数是一个长度为 0 的空缓冲区，表示此时没有要加密的数据
    shasign.update(Buffer.alloc(0));
    // base64加密
    const sign = shasign.digest('base64')
    dataBody = {
            timestamp,
            sign,
            ...dataBody
        }
    try {
        const {
            res
        } = await ctx.curl(`${url}`, {

            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                "content-type": 'application/json'
            },
            data: dataBody,
            dataType: 'json'
        })
        return {
            code: res.data.code,
            message: res.data.msg
        };
    } catch (error) {
        console.error(error);
        return false
    }
}
```

## 参考文献

（1）[飞书自定义机器人签名-node](https://blog.csdn.net/weixin_43110609/article/details/121082091)
（2）[飞书自定义机器人文档](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN?lang=zh-CN)
