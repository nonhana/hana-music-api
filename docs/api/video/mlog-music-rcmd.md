---
title: "歌曲相关视频"
description: "： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。"
---

# 歌曲相关视频

> ： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/mlog/music/rcmd` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `mlog_music_rcmd` |
| 文档分类 | 视频与 MV |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `songid` | string | ✅ | - | 歌曲 ID |
| `mvid` | string | — | - | 如果定义，此 mvid 对应的 MV 将会作为第一个返回。 |
| `limit` | number \| string | — | - | 取出的 Mlog 数量, 不包含第一个 mvid |

## HTTP 示例

```bash
GET /mlog/music/rcmd
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.mlog_music_rcmd({
  songid: "your-songid",
})

console.log(result.body)
```

## 补充说明

说明： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。

请注意：此接口偶尔会在相关视频后返回不相关视频，请合理使用。

**必选参数 :** `songid` : 歌曲 ID

**可选参数 :** `mvid` : 如果定义，此 mvid 对应的 MV 将会作为第一个返回。
`limit` : 取出的 Mlog 数量, 不包含第一个 mvid

**接口地址 :** `/mlog/music/rcmd`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
