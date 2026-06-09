---
title: '收藏的 MV 列表'
description: '调用此接口,可获取收藏的 MV 列表'
---

# 收藏的 MV 列表

> 调用此接口,可获取收藏的 MV 列表

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/sublist`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_sublist`   |
| 文档分类 | 视频与 MV      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /mv/sublist
```

## 编程式调用

```ts
import { mvSublist } from 'hana-music-api'

const result = await mvSublist()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取收藏的 MV 列表

**接口地址 :** `/mv/sublist`

**调用例子 :** `/mv/sublist`
