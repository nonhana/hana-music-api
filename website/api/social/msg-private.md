---
title: '通知 - 私信'
description: '登录后调用此接口 ，可获取私信'
---

# 通知 - 私信

登录后调用此接口 ，可获取私信

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/msg/private`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `msg_private`                                    |
| SDK 函数   | `msgPrivate`（`hana-music-api/api/msg_private`） |
| 返回体类型 | `MsgPrivateBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { msgPrivate } from 'hana-music-api';

const result = await msgPrivate(
  {
    limit: 3,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/msg/private' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=3'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                    |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MsgPrivateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/msg_private`、`hana-music-api/schemas/msg_private` 导入运行时校验器）。

```ts
type ConversationSummary = {
  id: number;
  fromUserId?: number | null;
  lastMsg?: string | null;
  lastMsgTime?: number | null;
  msgCount?: number | null;
  newMsgCount?: number | null;
  toUserId?: number | null;
};

type MessageUser = Omit<UserProfile, 'userId' | 'expertTags'> & {
  userId?: number | null;
  expertTags?: Array<string> | null;
};

type Conversation = {
  user: ConversationSummary;
  fromUser?: MessageUser | null;
  toUser?: MessageUser | null;
  lastMsg?: string | null;
  lastMsgId?: number | null;
  lastMsgTime?: number | null;
  msgSenderType?: number | null;
  newMsgCount?: number | null;
  noticeAccountFlag?: boolean | null;
};

type MsgPrivateBody = {
  code: 200;
  msgs: Array<Conversation>;
  more?: boolean | null;
  newMsgCount?: number | null;
};
```

- **公共类型**：[UserProfile](/api/shared-types#userprofile)

| 字段                         | 类型                  | 必填 | 说明                                                |
| ---------------------------- | --------------------- | ---- | --------------------------------------------------- |
| `code`                       | `200`                 | 是   | 业务状态码（`200` 表示成功）                        |
| `msgs`                       | `Array<Conversation>` | 是   | 私信会话列表                                        |
| `msgs[].user`                | `ConversationSummary` | 是   | -                                                   |
| `msgs[].user.id`             | `number`              | 是   | 记录 ID                                             |
| `msgs[].user.fromUserId`     | `number`              | 否   | fromUser ID                                         |
| `msgs[].user.lastMsg`        | `string`              | 否   | -                                                   |
| `msgs[].user.lastMsgTime`    | `number`              | 否   | 时间戳                                              |
| `msgs[].user.msgCount`       | `number`              | 否   | -                                                   |
| `msgs[].user.newMsgCount`    | `number`              | 否   | -                                                   |
| `msgs[].user.toUserId`       | `number`              | 否   | toUser ID                                           |
| `msgs[].fromUser`            | `MessageUser`         | 否   | 继承自 [UserProfile](/api/shared-types#userprofile) |
| `msgs[].fromUser.userId`     | `number`              | 否   | 用户 ID                                             |
| `msgs[].fromUser.expertTags` | `Array<string>`       | 否   | -                                                   |
| `msgs[].toUser`              | `MessageUser`         | 否   | 继承自 [UserProfile](/api/shared-types#userprofile) |
| `msgs[].toUser.userId`       | `number`              | 否   | 用户 ID                                             |
| `msgs[].toUser.expertTags`   | `Array<string>`       | 否   | -                                                   |
| `msgs[].lastMsg`             | `string`              | 否   | -                                                   |
| `msgs[].lastMsgId`           | `number`              | 否   | lastMsg ID                                          |
| `msgs[].lastMsgTime`         | `number`              | 否   | 时间戳                                              |
| `msgs[].msgSenderType`       | `number`              | 否   | -                                                   |
| `msgs[].newMsgCount`         | `number`              | 否   | -                                                   |
| `msgs[].noticeAccountFlag`   | `boolean`             | 否   | -                                                   |
| `more`                       | `boolean`             | 否   | 是否还有更多数据                                    |
| `newMsgCount`                | `number`              | 否   | -                                                   |

<!-- api-doc:response:end -->
