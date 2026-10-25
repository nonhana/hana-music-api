---
title: '歌手全部歌曲'
description: '调用此接口,可获取歌手全部歌曲'
---

# 歌手全部歌曲

> 调用此接口,可获取歌手全部歌曲

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/artist/songs` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `artist_songs`  |
| 文档分类 | 歌手            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                              |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------- |
| `id`     | string           |  ✅  | -      | 歌手 id                                                           |
| `order`  | string           |  —   | -      | `hot` ,`time` 按照热门或者时间排序                                |
| `limit`  | number \| string |  —   | 50     | 取出歌单数量，默认为 50                                           |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*50, 其中 50 为 limit 的值 |

## HTTP 示例

```bash
GET /artist/songs?id=6452
```

## 编程式调用

```ts
import { artistSongs } from 'hana-music-api';

const result = await artistSongs({
  id: '6452',
});

console.log(result.body);
```

## 返回内容

`body.code`、歌曲列表 `body.songs` 和每首歌的编号 `songs[].id` 收紧；`more`、`total` 是分页信息，宽松。歌曲记录复用共享的 `Song`，另补了宽松字段 `eq`，并把 `noCopyrightRcmd` 扩展成含 `expInfo`、`mvInfo`（`videos[]`）的宽松结构。`offset` 越过总数时返回空 `songs`（录制 `artist_songs.empty.json`）。`artist_songs.default.json` 截取保留 30 首；`noCopyrightRcmd` 的 `expInfo`、`mvInfo`、`videos[]` 非空证据在分页录制 `artist_songs.no-copyright.json`（`offset=70`，原始第 82 首；第 73 首在补录时已是 null）。结构定义和类型是 `ArtistSongsBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取歌手全部歌曲
**必选参数 :**

`id` : 歌手 id

**可选参数 :**

`order` : `hot` ,`time` 按照热门或者时间排序

`limit`: 取出歌单数量，默认为 50

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/artist/songs`

**调用例子 :** `/artist/songs?id=6452`
