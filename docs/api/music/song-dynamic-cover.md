---
title: '歌曲动态封面'
description: '登录后调用此接口, 传入歌曲id, 获取歌曲动态封面'
---

# 歌曲动态封面

> 登录后调用此接口, 传入歌曲id, 获取歌曲动态封面

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/song/dynamic/cover` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `song_dynamic_cover`  |
| 文档分类 | 歌曲与播放            |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /song/dynamic/cover?id=2101179024
```

## 编程式调用

```ts
import { songDynamicCover } from 'hana-music-api'

const result = await songDynamicCover({
  id: '2101179024',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 传入歌曲id, 获取歌曲动态封面

**必选参数 :**

`id`: 歌曲 id

**接口地址 :** `/song/dynamic/cover`

**调用例子 :** `/song/dynamic/cover?id=2101179024`
