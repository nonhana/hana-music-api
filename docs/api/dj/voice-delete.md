---
title: '播客删除'
description: '可以删除播客'
---

# 播客删除

> 可以删除播客

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/voice/delete` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `voice_delete`  |
| 文档分类 | 电台与播客      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voice/delete
```

## 编程式调用

```ts
import { voiceDelete } from 'hana-music-api'

const result = await voiceDelete()

console.log(result.body)
```

## 补充说明

说明: 可以删除播客

**接口地址:** `/voice/delete`

**必选参数：**

`ids`: 播客id，即voiceListId,多个以逗号隔开
