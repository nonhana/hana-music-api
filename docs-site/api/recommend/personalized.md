---
title: "推荐歌单"
description: "调用此接口 , 可获取推荐歌单"
---

# 推荐歌单

> 调用此接口 , 可获取推荐歌单

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/personalized` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `personalized` |
| 文档分类 | 推荐与发现 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `limit` | number \| string | — | 30 | 取出数量 , 默认为 30 (不支持 offset) |

## HTTP 示例

```bash
GET /personalized?limit=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.personalized({
  limit: "1",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取推荐歌单

**可选参数 :** `limit`: 取出数量 , 默认为 30 (不支持 offset)

**接口地址 :** `/personalized`

**调用例子 :** `/personalized?limit=1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
