---
title: '获取声音歌词'
description: '调用此接口可以获取声音歌词'
---

# 获取声音歌词

> 调用此接口可以获取声音歌词

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/voice/lyric` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `voice_lyric`  |
| 文档分类 | 电台与播客     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voice/lyric
```

## 编程式调用

```ts
import { voiceLyric } from 'hana-music-api';

const result = await voiceLyric();

console.log(result.body);
```

## 返回内容

`body.code` 和通到歌词的 `body.data` 收紧；没有歌词的声音 `data` 是 `null`（录制 `voice_lyric.without-lyric.json`），按可以没有处理，出现时 `data.lyricUrl` 仍收紧。`data.source` 和 `message` 只见过 `null`，未声明并原样保留。无播放权限的声音返回 HTTP 200、正文 `code: 400`（录制 `voice_lyric.unavailable.json`），SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `VoiceLyricBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可以获取声音歌词

**接口地址:** `/voice/lyric`

**必选参数：**
`id`: 声音id
