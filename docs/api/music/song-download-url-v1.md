---
title: '获取客户端歌曲下载链接 - 新版'
description: '使用 `/song/url/v1` 接口获取的是歌曲试听 url, 非 VIP 账号最高只能获取 `极高` 音质，但免费类型的歌曲(`fee == 0`)使用本接口可最高获取`Hi-Res`音质的url。'
---

# 获取客户端歌曲下载链接 - 新版

> 使用 `/song/url/v1` 接口获取的是歌曲试听 url, 非 VIP 账号最高只能获取 `极高` 音质，但免费类型的歌曲(`fee == 0`)使用本接口可最高获取`Hi-Res`音质的url。

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/song/download/url/v1` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `song_download_url_v1`  |
| 文档分类 | 歌曲与播放              |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明                                                                                                                              |
| ---------- | ------ | :--: | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | string |  ✅  | -      | 音乐 id                                                                                                                           |
| `level`    | string |  ✅  | -      | 播放音质等级, 分为 `standard` => `标准`,`higher` => `较高`, `exhigh`=>`极高`,                                                     |
| `lossless` | string |  ✅  | -      | =>`无损`, `hires`=>`Hi-Res`, `jyeffect` => `高清环绕声`, `sky` => `沉浸环绕声`, `dolby` => `杜比全景声`, `jymaster` => `超清母带` |

## HTTP 示例

```bash
GET /song/download/url/v1?id=2155423468&level=hires
```

## 编程式调用

```ts
import { songDownloadUrlV1 } from 'hana-music-api'

const result = await songDownloadUrlV1({
  id: '2155423468',
  level: 'hires',
})

console.log(result.body)
```

## 补充说明

说明 : 使用 `/song/url/v1` 接口获取的是歌曲试听 url, 非 VIP 账号最高只能获取 `极高` 音质，但免费类型的歌曲(`fee == 0`)使用本接口可最高获取`Hi-Res`音质的url。

**必选参数 :** `id` : 音乐 id
`level`: 播放音质等级, 分为 `standard` => `标准`,`higher` => `较高`, `exhigh`=>`极高`,
`lossless`=>`无损`, `hires`=>`Hi-Res`, `jyeffect` => `高清环绕声`, `sky` => `沉浸环绕声`, `dolby` => `杜比全景声`, `jymaster` => `超清母带`

**接口地址 :** `/song/download/url/v1`

**调用例子 :** `/song/download/url/v1?id=2155423468&level=hires`
