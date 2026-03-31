---
title: '电台 - 24 小时主播榜'
description: '调用此接口,可获取 24 小时主播榜'
---

# 电台 - 24 小时主播榜

> 调用此接口,可获取 24 小时主播榜

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/dj/toplist/hours` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `dj_toplist_hours`  |
| 文档分类 | 电台与播客          |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                  |
| ------- | ---------------- | :--: | ------ | ------------------------------------- |
| `limit` | number \| string |  —   | 100    | 返回数量 , 默认为 100 (不支持 offset) |

## HTTP 示例

```bash
GET /dj/toplist/hours?limit=30
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_toplist_hours({
  limit: '30',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取 24 小时主播榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/hours`

**调用例子 :** `/dj/toplist/hours?limit=30`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
