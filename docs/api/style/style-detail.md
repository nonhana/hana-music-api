---
title: '曲风详情'
description: '调用此接口可以获取该曲风的描述信息'
---

# 曲风详情

> 调用此接口可以获取该曲风的描述信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/style/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `style_detail`  |
| 文档分类 | 曲风            |

## 请求参数

| 参数    | 类型   | 必填 | 默认值 | 说明    |
| ------- | ------ | :--: | ------ | ------- |
| `tagId` | string |  ✅  | -      | 曲风 ID |

## HTTP 示例

```bash
GET /style/detail?tagId=1000
```

## 编程式调用

```ts
import { styleDetail } from 'hana-music-api'

const result = await styleDetail({
  tagId: '1000',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取该曲风的描述信息

**接口地址:** `/style/detail`

**必选参数:** `tagId`: 曲风 ID

**调用例子:** `/style/detail?tagId=1000`
