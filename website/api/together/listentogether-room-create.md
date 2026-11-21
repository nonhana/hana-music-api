---
title: '一起听 - 创建房间'
description: '创建一起听房间并返回 roomId，作为后续邀请、同步和控制的起点。'
---

# 一起听 - 创建房间

创建一起听房间并返回 roomId，作为后续邀请、同步和控制的起点。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| 接口地址   | `/listentogether/room/create`                                                 |
| 请求方式   | `GET` / `POST`                                                                |
| 需要登录   | 是                                                                            |
| 对应模块   | `listentogether_room_create`                                                  |
| SDK 函数   | `listentogetherRoomCreate`（`hana-music-api/api/listentogether_room_create`） |
| 返回体类型 | `ListentogetherRoomCreateBody`（已建模返回体）                                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherRoomCreate } from 'hana-music-api';

const result = await listentogetherRoomCreate(
  {},
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/listentogether/room/create' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherRoomCreateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_room_create`、`hana-music-api/schemas/listentogether_room_create` 导入运行时校验器）。

```ts
type RoomUser = {
  avatarUrl?: string | null;
  identityIcon?: string | null;
  identityName?: string | null;
  nickname?: string | null;
  userId?: number | null;
};

type RoomInfo = {
  agoraChannelId?: string | null;
  chatRoomId?: string | null;
  creatorId?: number | null;
  effectiveDurationMs?: number | null;
  ltType?: number | null;
  openHeartRcmd?: boolean | null;
  roomCreateTime?: number | null;
  roomId: string;
  roomType?: string | null;
  roomUsers?: Array<RoomUser> | null;
  roomVipAbGroup?: Record<string, string> | null;
  waitMs?: number | null;
};

type ListentogetherRoomCreateBody = {
  code: 200;
  data: {
    avatarPendantShow?: boolean | null;
    roomInfo: RoomInfo;
    type?: string | null;
  };
  message?: string | null;
};
```

| 字段                                | 类型                     | 必填 | 说明                         |
| ----------------------------------- | ------------------------ | ---- | ---------------------------- |
| `code`                              | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                              | `object`                 | 是   | 接口返回的数据主体           |
| `data.avatarPendantShow`            | `boolean`                | 否   | -                            |
| `data.roomInfo`                     | `RoomInfo`               | 是   | -                            |
| `data.roomInfo.agoraChannelId`      | `string`                 | 否   | agoraChannel ID              |
| `data.roomInfo.chatRoomId`          | `string`                 | 否   | chatRoom ID                  |
| `data.roomInfo.creatorId`           | `number`                 | 否   | 创建者 ID                    |
| `data.roomInfo.effectiveDurationMs` | `number`                 | 否   | -                            |
| `data.roomInfo.ltType`              | `number`                 | 否   | -                            |
| `data.roomInfo.openHeartRcmd`       | `boolean`                | 否   | -                            |
| `data.roomInfo.roomCreateTime`      | `number`                 | 否   | 时间戳                       |
| `data.roomInfo.roomId`              | `string`                 | 是   | 一起听房间 ID                |
| `data.roomInfo.roomType`            | `string`                 | 否   | -                            |
| `data.roomInfo.roomUsers`           | `Array<RoomUser>`        | 否   | -                            |
| `data.roomInfo.roomVipAbGroup`      | `Record<string, string>` | 否   | -                            |
| `data.roomInfo.waitMs`              | `number`                 | 否   | -                            |
| `data.type`                         | `string`                 | 否   | -                            |
| `message`                           | `string`                 | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **后续调用流程**：创建成功后取 `data.roomInfo.roomId` 与 `creatorId` 构造分享链接，并依次配合 [检查房间](/api/together/listentogether-room-check) 与 [同步播放列表](/api/together/listentogether-sync-list-command) 使用。
