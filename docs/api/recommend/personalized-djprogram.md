---
title: '推荐电台'
description: '调用此接口 , 可获取推荐电台'
---

# 推荐电台

> 调用此接口 , 可获取推荐电台

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/personalized/djprogram` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 否                        |
| 对应模块 | `personalized_djprogram`  |
| 文档分类 | 推荐与发现                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /personalized/djprogram
```

## 编程式调用

```ts
import { personalizedDjprogram } from 'hana-music-api'

const result = await personalizedDjprogram()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取推荐电台

**接口地址 :** `/personalized/djprogram`

**调用例子 :** `/personalized/djprogram`
