---
title: Elasticsearch查询语句使用
date: 2022-03-14 20:43:59
excerpt: <p>摸索Elasticsearch查询语句时搜索和实践体验到的知识点</p>
categories:
  - 技术学习
tags:
  - Elasticsearch
---


es 中的查询请求有两种方式，一种是简易版的查询，另外一种是使用 JSON 完整的请求体，叫做结构化查询（DSL）。DSL 的查询方式是 POST 过去一个 json，由于 post 的请求是 json 格式的，所以存在很多灵活性，也有很多形式。笔者出于使用 nodejs 技术调用 es 查询的需求，因此主要搜集的资料是关于 DSL 的。

本文并不是查询方法的全列举，而是针对自己实际使用的几种方法进行比较辨析。如果日后尝试使用其他方法，也会在这里添加补充说明。

{% note info %}
使用 DSL 查询语法时，由于使用 json 字符串时存在特殊符号例如`*,/,\`等影响解析，因此需要使用两个反斜杠`\\`进行转义
{% endnote %}

```TypeScript
const calcQueryString=(keyword:string)=>{
    return keyword.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1');
}
```

## 全文查询

### match
不需要完整的卢塞恩语法支持。在查询语句里任何一个词项与分词匹配都会返回该文档。如果要查询所有关键词的文档，可以使用 and 操作符连接。结果里关键词但次序无法保证。

查询结构示例：

```
{
  "query": {
    "match": {
        "content" : "小白的文件整理箱"
    }
  }
}
```

该查询语句可能根据分词规则分为“小白”、“白的”、“文”、“整理箱”等多种关键词，只要有匹配的字词就会被搜出来，例如“文无定法”、“文小白”等都有可能

### match_phrase
在执行短语匹配查询时，查询结果会满足两个条件：1）必须匹配短语中的所有分词 2）保证各个分词的相对位置不变。

以 match 的查询语句为例，查询结果不会出现“文小白”，但有可能出现“小白菜的 zip 文件垃圾整理行李箱”

### multi_match
match 语法的升级，可用于多个字段。也可以用指数符指定多个字段的权重

查询结构示例：

```
{
  "query": {
    "multi_match": {
        "query" : "小白的文件整理箱",
        "fields":["title^3","content"]
    }
  }
}
```

### query_string

常见写法：

```
{
  "query": {
    "query_string": {
      "query": "(new york city) OR (big apple)",
      "fields": ["content"]
    }
  }
}
```

支持运算符 AND 和 OR，括号内的查询语句作为整个查询。  
支持 wildcard 语法。

## 词项查询

### term
term 是代表完全匹配，返回的文件必须包含完整的关键词。

### terms
term 的升级版，可以查询多个字词。例如查询 content 字段包含“小白”和“文件整理箱”的文档。

查询结构示例：

```
{
  "query": {
    "terms": {
        "content" : ["小白","文件整理箱"]
    }
  }
}
```
### prefix
查询某个字段以固定前缀开始的文档。
```
{
  "query": {
    "prefix": {
        "content" : "小白"
    }
  }
}
```
该查询语句会返回“小白”、“小白菜”等所有以“小白”开头的content文档。

### wildcard
支持通配符搜索，可以使用?替换单个字符，用*替换零个或多个字符。通配符的查询效率较低不是很推荐。

### regexp
可以支持更为复杂的匹配模式。*（个人体验感觉不佳，用于带转义字段的查询时往往查不到，不知道什么原因；不如js的正则好用）*
````
{
    "query": {
        "regexp": {
            "postcode": "W[0-9].+" 
        }
    }
}
````
## 查询语句text字段和keyword字段的区别
ElasticSearch 5.0以后，String字段被拆分成两种新的数据类型: text用于全文搜索，会分词,而keyword用于关键词搜索，不进行分词。对于字符串类型的字段，ES默认会再生成一个keyword字段用于精确索引。

简单理解就是text字段会被分词，而keyword字段是要求不分词完整地查找全字段。

keyword的查询语句如下：
````
{
  "query": {
    "term": {
        "content.keyword" : "小白"
    }
  }
}
````

## 查询字段时 term、match、match_phrase、query_string 的区别

### 1.1 term

1）term 查询 keyword 字段。

term 不会分词。而 keyword 字段也不分词。需要完全匹配才可。

2）term 查询 text 字段

因为 text 字段会分词，而 term 不分词，所以 term 查询的条件必须是 text 字段分词后的某一个。

eg. brown big box 作为 text 字段会被分为[ brown, big, box ]的词组，当 term 的查询内容为 brown 时可返回该词条
当 term 的查询内容为 brown big 的时候则不会返回

### 1.2 match

1）match 查询 keyword 字段

match 会被分词，而 keyword 不会被分词，match 的需要跟 keyword 的完全匹配可以。

其他的不完全匹配的都是失败的。

2）match 查询 text 字段

match 分词，text 也分词，只要 match 的分词结果和 text 的分词结果有相同的就匹配。

eg. brown big box 的词条，当 term 的查询内容为 fox 时也可返回该词条，因为存在“ox“这一相同内容

### 1.3.match_phrase

1）match_phrase 匹配 keyword 字段。

这个同上必须跟 keyword 一致才可以。

2）match_phrase 匹配 text 字段。

match_phrase 是分词的，text 也是分词的。match_phrase 的分词结果必须在 text 字段分词中都包含，而且顺序必须相同，而且必须都是连续的。

_（与 match 匹配 text 情况相比就多了顺序相同一个条件）_

### 1.4.query_string

1）query_string 查询 keyword 类型的字段。

网上有说法无法查询。但根据实际经验做长字符串的查询是可行的，可能是 Lucene 语法使用不当的问题。  

query_string 查询 keyword 字段如果只是使用了局部字段查询的话需要在前后加“\*”。

2）query_string 查询 text 类型的字段。

和 match_phrase 区别的是，不需要连续，顺序还可以调换。

## 参考资料
（1）[Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html)
（2）《从Lucene到ElasticSearch：全文检索实战》
（3）[ES之五：关于Elasticsearch查找相关的问题汇总（match、match_phrase、query_string和term）](https://www.cnblogs.com/duanxz/p/3508338.html)
（4）[elasticsearch 查询（match和term）](https://www.cnblogs.com/yjf512/p/4897294.html)