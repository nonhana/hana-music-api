---
title: "获取歌手视频"
description: "调用此接口 , 传入歌手 id, 可获得歌手视频"
---

# 获取歌手视频

> 调用此接口 , 传入歌手 id, 可获得歌手视频

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/artist/video` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `artist_video` |
| 文档分类 | 歌手 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌手 id |
| `size` | number \| string | — | 10 | 返回数量 , 默认为 10 |
| `cursor` | number \| string | — | 0 | 返回数据的 cursor, 默认为 0 , 传入上一次返回结果的 cursor,将会返回下一页的数据 |
| `order` | string | — | 0 | 排序方法, 0 表示按时间排序, 1 表示按热度排序, 默认为 0 |

## HTTP 示例

```bash
GET /artist/video?id=2116
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.artist_video({
  id: "2116",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌手 id, 可获得歌手视频

**必选参数 :** `id` : 歌手 id

**可选参数 :** `size` : 返回数量 , 默认为 10

`cursor` : 返回数据的 cursor, 默认为 0 , 传入上一次返回结果的 cursor,将会返回下一页的数据

`order` : 排序方法, 0 表示按时间排序, 1 表示按热度排序, 默认为 0

**接口地址 :** `/artist/video`

**调用例子 :** `/artist/video?id=2116`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
