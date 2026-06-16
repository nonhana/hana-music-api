---
title: '用户贡献内容'
description: '登录后调用此接口,使用此接口,可获取当前登录用户贡献内容'
---

# 用户贡献内容

> 登录后调用此接口,使用此接口,可获取当前登录用户贡献内容

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/ugc/detail`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `ugc_detail`   |
| 文档分类 | 百科与用户贡献 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/detail
```

## 编程式调用

```ts
import { ugcDetail } from 'hana-music-api'

const result = await ugcDetail()

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,可获取当前登录用户贡献内容

**必选参数：**

`type`: 内容种类
分为以下几种类型:
曲库纠错 歌手:1 专辑:2 歌曲:3 MV:4 歌词:5 翻译:6
曲库补充 专辑:101 MV:103

**可选参数：**
`limit`: 取出条目数量，默认为 10

`offset`: 偏移数量

`auditStatus`: 审核状态
待审核:0 未采纳:-5 审核中:1 部分审核通过:4 审核通过:5

`order`: 排序,默认为降序 降序:desc 顺序:asc

**接口地址:** `/ugc/detail`

**调用例子:** `/ugc/detail`
