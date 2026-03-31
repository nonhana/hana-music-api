---
title: "收藏的专栏"
description: "调用此接口,可获取收藏的专栏"
---

# 收藏的专栏

> 调用此接口,可获取收藏的专栏

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/topic/sublist` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `topic_sublist` |
| 文档分类 | 社交与消息 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `limit` | number \| string | — | 50 | 取出歌单数量 , 默认为 50 |
| `offset` | number \| string | — | - | 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值 |

## HTTP 示例

```bash
GET /topic/sublist?limit=2&offset=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.topic_sublist({
  limit: "2",
  offset: "1",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取收藏的专栏

**可选参数 :**

`limit`: 取出歌单数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/topic/sublist`

**调用例子 :** `/topic/sublist?limit=2&offset=1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
