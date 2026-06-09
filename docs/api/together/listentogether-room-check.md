---
title: '一起听 - 房间检查'
description: '检查一起听房间是否可加入以及当前可用状态。'
---

# 一起听 - 房间检查

> 校验房间是否存在、是否还能加入，以及当前房间状态。

## 接口信息

| 项目     | 值                                |
| -------- | --------------------------------- |
| 接口地址 | `/listentogether/room/check`      |
| 请求方式 | `GET` / `POST`                    |
| 需要登录 | 是                                |
| 对应模块 | `listentogether_room_check`       |
| 文档分类 | 一起听                            |
| 上游路径 | `/api/listen/together/room/check` |

## 请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明    |
| -------- | ------ | :--: | ------ | ------- |
| `roomId` | string |  ✅  | -      | 房间 ID |

## HTTP 示例

```bash
POST /listentogether/room/check?roomId=MzA0NjY5...
```

## 编程式调用

```ts
import { listentogetherRoomCheck } from 'hana-music-api'

const result = await listentogetherRoomCheck({
  roomId: 'MzA0NjY5...',
})

console.log(result.body)
```

## 返回示例

```json
{
  "code": 200,
  "data": {
    "joinable": true,
    "type": "NORMAL",
    "copywriting": null,
    "status": "AVAILABLE"
  },
  "message": ""
}
```

## 返回关注点

- `data.joinable`: 当前房间是否还能加入。
- `data.status`: 房间状态，公开样例里可见 `AVAILABLE`。
- `data.type`: 房间类型，公开样例里可见 `NORMAL`。
- `data.copywriting`: 服务端返回的补充文案，可能为空。

## 调用场景

- 房主创建房间后检查是否创建成功。
- 从机接受邀请前后确认房间仍可加入。
- 前端在分享页或轮询逻辑里做可用性校验。

## 相关接口

- [`/listentogether/room/create`](/api/together/listentogether-room-create)
- [`/listentogether/accept`](/api/together/listentogether-accept)
