---
title: '关注歌手新歌'
description: '登录后调用此接口可获取关注歌手新歌'
---

# 关注歌手新歌

> 登录后调用此接口可获取关注歌手新歌

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/artist/new/song` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `artist_new_song`  |
| 文档分类 | 歌手               |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                |
| -------- | ---------------- | :--: | ------ | ----------------------------------- |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20             |
| `before` | number \| string |  —   | -      | 上一页数据返回的 publishTime 的数据 |

## HTTP 示例

```bash
GET /artist/new/song?limit=1
GET /artist/new/song?limit=1&before=1602777625000
```

## 编程式调用

```ts
import { artistNewSong } from 'hana-music-api';

const result = await artistNewSong({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data` 和每首歌的编号 `data.newWorks[].songLists[].id` 收紧；`data.hasMore`、`data.newSongCount`、`message` 宽松。`data.newWorks` 是收紧的数组：匿名访问返回空数组（录制 `artist_new_song.anonymous-empty.json`），这是正常结果；缺失、`null` 或 `songLists` 里有坏记录都报 502。登录录制（`artist_new_song.default.json`）原 `newSongCount` 是 2213、20 个 block/62 首歌，仓库里截取保留 2 个 block、5 首歌，原始数量写在 `context.truncated`。block 的 `blockTitle`、`blockType`、`publishTime`、`albumId`、`albumSongCount`、`accompanimentIds` 都是宽松字段。结构定义和类型是 `ArtistNewSongBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 :登录后调用此接口可获取关注歌手新歌

**可选参数 :** `limit`: 取出评论数量，默认为 20

`before`: 上一页数据返回的 publishTime 的数据

**接口地址 :** `/artist/new/song`

**调用例子 :** `/artist/new/song?limit=1` `/artist/new/song?limit=1&before=1602777625000`
