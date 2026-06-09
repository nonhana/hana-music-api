---
title: '推荐 mv'
description: '调用此接口 , 可获取推荐 mv'
---

# 推荐 mv

> 调用此接口 , 可获取推荐 mv

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/personalized/mv` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `personalized_mv`  |
| 文档分类 | 推荐与发现         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /personalized/mv
```

## 编程式调用

```ts
import { personalizedMv } from 'hana-music-api'

const result = await personalizedMv()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取推荐 mv

**接口地址 :** `/personalized/mv`

**调用例子 :** `/personalized/mv`
