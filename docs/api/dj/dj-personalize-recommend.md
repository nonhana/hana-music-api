---
title: '电台个性推荐'
description: '调用此接口,可获取电台个性推荐列表'
---

# 电台个性推荐

> 调用此接口,可获取电台个性推荐列表

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/dj/personalize/recommend` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `dj_personalize_recommend`  |
| 文档分类 | 电台与播客                  |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                              |
| ------- | ---------------- | :--: | ------ | --------------------------------- |
| `limit` | number \| string |  —   | 6      | 返回数量,默认为 6,总条数最多 6 条 |

## HTTP 示例

```bash
GET /dj/personalize/recommend?limit=5
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_personalize_recommend({
  limit: '5',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取电台个性推荐列表
**可选参数 :**

`limit` : 返回数量,默认为 6,总条数最多 6 条

**接口地址 :** `/dj/personalize/recommend`

**调用例子 :** `/dj/personalize/recommend?limit=5`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
