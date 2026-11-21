---
title: '一起听 - 接受邀请'
description: '使用 roomId 和 inviterId 接受一起听邀请并加入房间。'
---

# 一起听 - 接受邀请

使用 roomId 和 inviterId 接受一起听邀请并加入房间。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                   |
| ---------- | -------------------------------------------------------------------- |
| 接口地址   | `/listentogether/accept`                                             |
| 请求方式   | `GET` / `POST`                                                       |
| 需要登录   | 是                                                                   |
| 对应模块   | `listentogether_accept`                                              |
| SDK 函数   | `listentogetherAccept`（`hana-music-api/api/listentogether_accept`） |
| 返回体类型 | `ListentogetherAcceptBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherAccept } from 'hana-music-api';

const result = await listentogetherAccept(
  {
    roomId: 'MzA0NjY5...',
    inviterId: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listentogether/accept' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'roomId=MzA0NjY5...' \
  --data-urlencode 'inviterId=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型               | 必填 | 默认值 | 说明                        |
| ----------- | ------------------ | ---- | ------ | --------------------------- |
| `inviterId` | `number \| string` | 是   | -      | 邀请者，也就是房主的用户 ID |
| `roomId`    | `string`           | 是   | -      | 房间 ID                     |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherAcceptBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_accept`、`hana-music-api/schemas/listentogether_accept` 导入运行时校验器）。

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
  roomId?: string | null;
  roomType?: string | null;
  roomUsers?: Array<RoomUser> | null;
  roomVipAbGroup?: Record<string, string> | null;
  waitMs?: number | null;
};

type ListentogetherAcceptBody = {
  code: 200;
  data?: {
    hintText?: string | null;
    roomInfo?: RoomInfo | null;
    type?: string | null;
  } | null;
  message?: string | null;
};
```

| 字段                                | 类型                     | 必填 | 说明                         |
| ----------------------------------- | ------------------------ | ---- | ---------------------------- |
| `code`                              | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                              | `object`                 | 否   | 接口返回的数据主体           |
| `data.hintText`                     | `string`                 | 否   | -                            |
| `data.roomInfo`                     | `RoomInfo`               | 否   | -                            |
| `data.roomInfo.agoraChannelId`      | `string`                 | 否   | agoraChannel ID              |
| `data.roomInfo.chatRoomId`          | `string`                 | 否   | chatRoom ID                  |
| `data.roomInfo.creatorId`           | `number`                 | 否   | 创建者 ID                    |
| `data.roomInfo.effectiveDurationMs` | `number`                 | 否   | -                            |
| `data.roomInfo.ltType`              | `number`                 | 否   | -                            |
| `data.roomInfo.openHeartRcmd`       | `boolean`                | 否   | -                            |
| `data.roomInfo.roomCreateTime`      | `number`                 | 否   | 时间戳                       |
| `data.roomInfo.roomId`              | `string`                 | 否   | 一起听房间 ID                |
| `data.roomInfo.roomType`            | `string`                 | 否   | -                            |
| `data.roomInfo.roomUsers`           | `Array<RoomUser>`        | 否   | -                            |
| `data.roomInfo.roomVipAbGroup`      | `Record<string, string>` | 否   | -                            |
| `data.roomInfo.waitMs`              | `number`                 | 否   | -                            |
| `data.type`                         | `string`                 | 否   | -                            |
| `message`                           | `string`                 | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **调用顺序**：从分享链接获取 `roomId` 与 `inviterId` → 调用本接口加入房间 → 调用 [检查房间](/api/together/listentogether-room-check) 与 [获取房间状态](/api/together/listentogether-status) 同步最新状态；加入已结束房间会返回 `code: 488`。
