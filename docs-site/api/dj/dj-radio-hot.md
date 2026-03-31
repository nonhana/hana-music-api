---
title: "电台 - 类别热门电台"
description: "电台 - 类别热门电台 接口文档。"
---

# 电台 - 类别热门电台

> 电台 - 类别热门电台 接口文档。

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/dj/radio/hot` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `dj_radio_hot` |
| 文档分类 | 电台与播客 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `limit` | number \| string | — | 30 | 返回数量 , 默认为 30 |
| `offset` | number \| string | — | 0 | 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0 |
| `cateId` | string | — | - | 类别 id,可通过 `/dj/category/recommend` 接口获取 |

## HTTP 示例

```bash
GET /dj/radio/hot?cateId=2001
GET /dj/radio/hot?cateId=10002
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_radio_hot({
  cateId: "2001",
})

console.log(result.body)
```

## 补充说明

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

`cateId`: 类别 id,可通过 `/dj/category/recommend` 接口获取

**接口地址 :** `/dj/radio/hot`

**调用例子 :** `/dj/radio/hot?cateId=2001`(创作|翻唱) `/dj/radio/hot?cateId=10002` (3D|电子)

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
