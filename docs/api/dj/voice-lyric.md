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
import { voiceLyric } from 'hana-music-api'

const result = await voiceLyric()

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取声音歌词

**接口地址:** `/voice/lyric`

**必选参数：**
`id`: 声音id
