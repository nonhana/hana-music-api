---
title: '我的数字专辑'
description: '登录后调用此接口 ,可获取我的数字专辑'
---

# 我的数字专辑

> 登录后调用此接口 ,可获取我的数字专辑

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/digitalAlbum/purchased` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 是                        |
| 对应模块 | `digitalAlbum_purchased`  |
| 文档分类 | 专辑                      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /digitalAlbum/purchased?limit=10
```

## 编程式调用

```ts
import { digitalAlbumPurchased } from 'hana-music-api'

const result = await digitalAlbumPurchased({
  limit: '10',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取我的数字专辑

**接口地址 :** `/digitalAlbum/purchased`

**调用例子 :** `/digitalAlbum/purchased?limit=10`
