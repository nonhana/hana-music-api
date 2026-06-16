---
title: '一起听 - 获取同步歌单'
description: '获取一起听房间当前同步的播放列表快照。'
---

# 一起听 - 获取同步歌单

> 获取房间当前共享的播放列表内容，通常在加入房间后立即调用。

## 接口信息

| 项目     | 值                                       |
| -------- | ---------------------------------------- |
| 接口地址 | `/listentogether/sync/playlist/get`      |
| 请求方式 | `GET` / `POST`                           |
| 需要登录 | 是                                       |
| 对应模块 | `listentogether_sync_playlist_get`       |
| 文档分类 | 一起听                                   |
| 上游路径 | `/api/listen/together/sync/playlist/get` |

## 请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明    |
| -------- | ------ | :--: | ------ | ------- |
| `roomId` | string |  ✅  | -      | 房间 ID |

## HTTP 示例

```bash
POST /listentogether/sync/playlist/get?roomId=MzA0NjY5...
```

## 编程式调用

```ts
import { listentogetherSyncPlaylistGet } from 'hana-music-api'

const result = await listentogetherSyncPlaylistGet({
  roomId: 'MzA0NjY5...',
})

console.log(result.body)
```

## 返回关注点

- `data.playlist`: 房间当前同步的歌单快照。
- `data.playlist.displayList.result`: 上游示例页直接使用这里的歌曲 ID 列表，再调用 `song/detail` 补齐歌曲详情。

## 补充说明

- 如果只需要播放顺序，本接口返回的房间歌单快照已经足够；如果还需要歌曲详情，请配合 `song/detail` 使用。

## 相关接口

- [`/listentogether/sync/list/command`](/api/together/listentogether-sync-list-command)
- [`/song/detail`](/api/music/song-detail)
