---
title: '获取专辑内容'
description: '调用此接口 , 传入专辑 id, 可获得专辑内容'
---

# 获取专辑内容

> 调用此接口 , 传入专辑 id, 可获得专辑内容

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/album`       |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `album`        |
| 文档分类 | 专辑           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 专辑 id |

## HTTP 示例

```bash
GET /album?id=32311
```

## 编程式调用

```ts
import { album } from 'hana-music-api'

const result = await album({
  id: '32311',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入专辑 id, 可获得专辑内容

**必选参数 :** `id`: 专辑 id

**接口地址 :** `/album`

**调用例子 :** `/album?id=32311`
