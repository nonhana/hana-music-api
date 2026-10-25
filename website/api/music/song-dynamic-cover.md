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
import { songDynamicCover } from 'hana-music-api';

const result = await songDynamicCover({
  id: '2101179024',
});

console.log(result.body);
```

## 返回内容

`body` 是网易云原文；`code` 和封面路径 `data` 收紧。`data.videoPlayUrl` 是接口要拿的动态封面地址，按可以没有处理：歌曲没有动态封面时整个字段缺失（`data` 是空对象），缺失或 `null` 都照常返回；出现但类型不对会报 502。`videoPlayUrl` 带 `wsSecret`/`wsTime` 签名参数，会随时间变化，不要缓存或逐字比较。`height`、`weight`、`needTransition` 和顶层 `message` 宽松。

公开文档写的是登录后调用，但本次匿名探测也返回同样的结构；`song_dynamic_cover.anonymous.json` 是匿名对照。结构定义和类型是 `SongDynamicCoverBody`，见 [返回体结构](/guide/response-bodies#曲库)。

## 补充说明

说明 : 登录后调用此接口, 传入歌曲id, 获取歌曲动态封面

**必选参数 :**

`id`: 歌曲 id

**接口地址 :** `/song/dynamic/cover`

**调用例子 :** `/song/dynamic/cover?id=2101179024`
