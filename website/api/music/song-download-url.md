---
title: '获取客户端歌曲下载 url'
description: '使用 `/song/url` 接口获取的是歌曲试听 url, 但存在部分歌曲在非 VIP 账号上可以下载无损音质而不能试听无损音质, 使用此接口可使非 VIP 账号获取这些歌曲的无损音频'
---

# 获取客户端歌曲下载 url

> 使用 `/song/url` 接口获取的是歌曲试听 url, 但存在部分歌曲在非 VIP 账号上可以下载无损音质而不能试听无损音质, 使用此接口可使非 VIP 账号获取这些歌曲的无损音频

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/song/download/url` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `song_download_url`  |
| 文档分类 | 歌曲与播放           |

## 请求参数

| 参数 | 类型             | 必填 | 默认值 | 说明                                                                        |
| ---- | ---------------- | :--: | ------ | --------------------------------------------------------------------------- |
| `id` | string           |  ✅  | -      | 音乐 id (仅支持单首歌曲)                                                    |
| `br` | number \| string |  —   | 999000 | 码率, 默认设置了 999000 即最大码率, 如果要 320k 则可设置为 320000, 其他类推 |

## HTTP 示例

```bash
GET /song/download/url
```

## 编程式调用

```ts
import { songDownloadUrl } from 'hana-music-api';

const result = await songDownloadUrl({
  id: '123456',
});

console.log(result.body);
```

## 返回内容

正常录制与网易云原文逐字段一致，SDK 不做重排或改写；宽松字段类型不对时只丢该项。`body.data` 是一个对象，不是数组。只有 `code`、`data`、`data.id`、`data.url`、`data.code` 收紧；`level`（实际给到的音质）、`size`（文件字节数）、`br`、`md5`、`freeTrialInfo` 等其余字段宽松。结构定义和类型是 `SongDownloadUrlBody`，与播放地址共用内部 `SongUrlData` 结构；`auEff` 等字段按播放地址的证据声明，下载录制里只见过 `null`。

拿不到地址时 `data.url` 是 `null`，原因看 `data.code`。本批匿名录制会员歌 `1409311773` 得到 `-105`（当前身份没有下载权限），无版权歌 `2108191414` 得到 `-110`；但这些码也会出现在可播放/免费歌曲上：`song_download_url.free.json` 记录歌 `2736209461` 为 200，随后同一请求重录为 -110（`song_download_url.transient-110.json`）。因此一次 `data.code` 不能判定无版权/无权限，先重试或交叉验证。免费歌 `3334340855` 在 `br=128000` 下拿到 `data.code: 200` 的地址，实际音质是 `standard`（128000）；请求 `br=999000` 也可能降级到 128000，说明请求码率可能被降级。顶层 `body.code` 仍是 200。

本批只保留匿名和失效 Cookie 录制；失效 Cookie 不是登录证据，没有登录对照，不对登录后的 `freeTrialInfo`、`payed` 等字段作相同性断言。

下载前先重试一次；仍不满足 `data.code === 200`、`data.url !== null`、`data.size > 0` 时再标记下载失败，保留 `data.code` 说明原因，不要用播放接口的试听地址补位。完整的录制边界见 [返回体结构](/guide/response-bodies#播放)。

## 补充说明

说明 : 使用 `/song/url` 接口获取的是歌曲试听 url, 但存在部分歌曲在非 VIP 账号上可以下载无损音质而不能试听无损音质, 使用此接口可使非 VIP 账号获取这些歌曲的无损音频

**必选参数 :** `id` : 音乐 id (仅支持单首歌曲)

**可选参数 :** `br` : 码率, 默认设置了 999000 即最大码率, 如果要 320k 则可设置为 320000, 其他类推

**接口地址 :** `/song/download/url`
