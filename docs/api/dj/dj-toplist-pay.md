---
title: '电台 - 付费精品'
description: '调用此接口,可获取付费精品电台'
---

# 电台 - 付费精品

> 调用此接口,可获取付费精品电台

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/dj/toplist/pay` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `dj_toplist_pay`  |
| 文档分类 | 电台与播客        |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                  |
| ------- | ---------------- | :--: | ------ | ------------------------------------- |
| `limit` | number \| string |  —   | 100    | 返回数量 , 默认为 100 (不支持 offset) |

## HTTP 示例

```bash
GET /dj/toplist/pay?limit=30
```

## 编程式调用

```ts
import { djToplistPay } from 'hana-music-api'

const result = await djToplistPay({
  limit: '30',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取付费精品电台

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/pay`

**调用例子 :** `/dj/toplist/pay?limit=30`
