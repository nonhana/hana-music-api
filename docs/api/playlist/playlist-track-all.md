---
title: "获取歌单所有歌曲"
description: "由于网易云接口限制，歌单详情只会提供 10 首歌，通过调用此接口，传入对应的歌单`id`，即可获得对应的所有歌曲"
---

# 获取歌单所有歌曲

> 由于网易云接口限制，歌单详情只会提供 10 首歌，通过调用此接口，传入对应的歌单`id`，即可获得对应的所有歌曲

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/track/all` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_track_all` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌单 id |
| `limit` | number \| string | — | 当前歌单的歌曲数量 | 限制获取歌曲的数量，默认值为当前歌单的歌曲数量 |

## HTTP 示例

```bash
GET /playlist/track/all?id=24381616&limit=10&offset=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_track_all({
  id: "24381616",
  limit: "10",
  offset: "1",
})

console.log(result.body)
```

## 补充说明

说明 : 由于网易云接口限制，歌单详情只会提供 10 首歌，通过调用此接口，传入对应的歌单`id`，即可获得对应的所有歌曲

**必选参数 :** `id` : 歌单 id

**可选参数 :** `limit` : 限制获取歌曲的数量，默认值为当前歌单的歌曲数量

**可选参数 :** `offset` : 默认值为0

**接口地址 :** `/playlist/track/all`

**调用例子 :** `/playlist/track/all?id=24381616&limit=10&offset=1`

> 注：关于`offset`，你可以这样理解，假设你当前的歌单有200首歌
> 
> 你传入limit=50&offset=0等价于limit=50，你会得到第1-50首歌曲

> 你传入limit=50&offset=50，你会得到第51-100首歌曲

> 如果你设置limit=50&offset=100，你就会得到第101-150首歌曲

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
