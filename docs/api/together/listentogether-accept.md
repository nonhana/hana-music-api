---
title: '一起听 - 接受邀请'
description: '使用 roomId 和 inviterId 接受一起听邀请并加入房间。'
---

# 一起听 - 接受邀请

> 使用房间 ID 和邀请者 ID 加入一起听房间。

## 接口信息

| 项目     | 值                                            |
| -------- | --------------------------------------------- |
| 接口地址 | `/listentogether/accept`                      |
| 请求方式 | `GET` / `POST`                                |
| 需要登录 | 是                                            |
| 对应模块 | `listentogether_accept`                       |
| 文档分类 | 一起听                                        |
| 上游路径 | `/api/listen/together/play/invitation/accept` |

## 请求参数

| 参数        | 类型   | 必填 | 默认值 | 说明                        |
| ----------- | ------ | :--: | ------ | --------------------------- |
| `roomId`    | string |  ✅  | -      | 房间 ID                     |
| `inviterId` | string |  ✅  | -      | 邀请者，也就是房主的用户 ID |

当前实现会额外固定带上 `refer=inbox_invite`，不需要手动传入。

## HTTP 示例

```bash
POST /listentogether/accept?roomId=MzA0NjY5...&inviterId=32953014
```

## 编程式调用

```ts
import { listentogetherAccept } from 'hana-music-api'

const result = await listentogetherAccept({
  roomId: 'MzA0NjY5...',
  inviterId: '32953014',
})

console.log(result.body)
```

## 返回关注点

- `code`: 是否加入成功。
- `message`: 失败时的错误信息。
- 实际接入时通常在成功后立刻补调其他接口拉取房间和歌单状态。

## 调用顺序

1. 从分享链接中拿到 `roomId` 和 `inviterId`。
2. 调用本接口接受邀请。
3. 调用 [`/listentogether/room/check`](/api/together/listentogether-room-check) 检查房间是否可加入。
4. 调用 [`/listentogether/sync/playlist/get`](/api/together/listentogether-sync-playlist-get) 拉取当前房间的播放列表。
5. 轮询或按需调用 [`/listentogether/status`](/api/together/listentogether-status) 获取成员和当前房间状态。
