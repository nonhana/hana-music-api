---
title: "推荐节目"
description: "调用此接口 , 可获取推荐电台"
---

# 推荐节目

> 调用此接口 , 可获取推荐电台

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/program/recommend` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `program_recommend` |
| 文档分类 | 推荐与发现 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `limit` | number \| string | — | 10 | 取出数量 , 默认为 10 |
| `offset` | number \| string | — | <br>为 | 偏移数量 , 用于分页 , 如 :( 页数 -1)\*10, 其中 10 为 limit 的值 , 默认<br>为 0 |

## HTTP 示例

```bash
GET /program/recommend?limit=5
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.program_recommend({
  limit: "5",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取推荐电台

**接口地址 :** `/program/recommend`

**可选参数 :**  
`limit`: 取出数量 , 默认为 10

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*10, 其中 10 为 limit 的值 , 默认
为 0

**调用例子 :** `/program/recommend?limit=5`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
