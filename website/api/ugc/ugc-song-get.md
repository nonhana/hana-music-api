---
title: '歌曲简要百科信息'
description: '登录后调用此接口,使用此接口,传入歌曲id,可获取对应的歌曲简要百科信息'
---

# 歌曲简要百科信息

> 登录后调用此接口,使用此接口,传入歌曲id,可获取对应的歌曲简要百科信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/ugc/song/get` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `ugc_song_get`  |
| 文档分类 | 百科与用户贡献  |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/song/get?id=2058263032
```

## 编程式调用

```ts
import { ugcSongGet } from 'hana-music-api';

const result = await ugcSongGet({
  id: '2058263032',
});

console.log(result.body);
```

## 返回内容

`body.code`、歌曲百科记录的路径 `body.data` 和歌曲自己的编号 `body.data.songId` 收紧。未知歌曲返回 `code: 200` 但没有 `data`，`data` 缺失或为 `null` 都照常返回；出现却没有 `songId` 仍报 502。歌曲名、歌手、专辑引用、语言、歌词正文和翻译、播放地址、锁状态和时长全部宽松；只见过 `null` 的字段（如 `no`、`mvIds`、`songTags`）和只见过空数组的 `arrangeArtists` 没有声明，原样保留。输入仍是 legacy，不做 id 本地校验。结构定义和类型是 `UgcSongGetBody`，见[返回体结构](/guide/response-bodies#百科与用户贡献)。

## 补充说明

说明: 登录后调用此接口,使用此接口,传入歌曲id,可获取对应的歌曲简要百科信息

**必选参数：**

`id`: 歌曲id

**接口地址:** `/ugc/song/get`

**调用例子:** `/ugc/song/get?id=2058263032`
