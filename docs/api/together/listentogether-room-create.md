---
title: '一起听 - 创建房间'
description: '创建一起听房间并返回 roomId，作为后续邀请、同步和控制的起点。'
---

# 一起听 - 创建房间

> 创建一起听房间，返回 `roomId` 和房主信息。

## 接口信息

| 项目     | 值                                 |
| -------- | ---------------------------------- |
| 接口地址 | `/listentogether/room/create`      |
| 请求方式 | `GET` / `POST`                     |
| 需要登录 | 是                                 |
| 对应模块 | `listentogether_room_create`       |
| 文档分类 | 一起听                             |
| 上游路径 | `/api/listen/together/room/create` |

## 请求参数

无需业务参数。当前实现会固定带上 `refer=songplay_more`。

## HTTP 示例

```bash
GET /listentogether/room/create
```

## 编程式调用

```ts
import { listentogetherRoomCreate } from 'hana-music-api'

const result = await listentogetherRoomCreate()

console.log(result.body)
```

## 返回示例

```json
{
  "type": "NEW_ROOM",
  "roomInfo": {
    "creatorId": 1,
    "roomId": "$ROOM_ID"
  }
}
```

## 返回关注点

- `data.roomInfo.roomId`: 房间 ID，后续接口基本都依赖它。
- `data.roomInfo.creatorId`: 房主用户 ID，可直接作为分享链接中的 `inviterId`。
- `data.type`: 常见为 `NEW_ROOM`。

## 调用顺序

1. 登录账号并创建房间。
2. 用 `songId`、`roomId`、`creatorId` 拼接分享链接：
   `https://st.music.163.com/listen-together/share/?songId=歌曲ID&roomId=房间ID&inviterId=创建者ID`
3. 调用 [`/listentogether/room/check`](/api/together/listentogether-room-check) 确认房间可用。
4. 主机准备歌单后调用 [`/listentogether/sync/list/command`](/api/together/listentogether-sync-list-command) 推送房间播放列表。
