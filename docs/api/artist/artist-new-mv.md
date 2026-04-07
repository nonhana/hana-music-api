---
title: '关注歌手新 MV'
description: '登录后调用此接口可获取关注歌手新 MV'
---

# 关注歌手新 MV

> 登录后调用此接口可获取关注歌手新 MV

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/artist/new/mv` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `artist_new_mv`  |
| 文档分类 | 歌手             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                |
| -------- | ---------------- | :--: | ------ | ----------------------------------- |
| `limit`  | number \| string |  —   | 20     | 取出评论数量 , 默认为 20            |
| `before` | number \| string |  —   | -      | 上一页数据返回的 publishTime 的数据 |

## HTTP 示例

```bash
GET /artist/new/mv?limit=1
GET /artist/new/mv?limit=1&before=1602777625000
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.artist_new_mv({
  limit: '1',
})

console.log(result.body)
```

## 补充说明

说明 :登录后调用此接口可获取关注歌手新 MV

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`before`: 上一页数据返回的 publishTime 的数据

**接口地址 :** `/artist/new/mv`

**调用例子 :** `/artist/new/mv?limit=1` `/artist/new/mv?limit=1&before=1602777625000`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
