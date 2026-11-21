---
title: '私信内容'
description: '登录后调用此接口，可获取私信内容'
---

# 私信内容

登录后调用此接口，可获取私信内容

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/msg/private/history`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 是                                                              |
| 对应模块   | `msg_private_history`                                           |
| SDK 函数   | `msgPrivateHistory`（`hana-music-api/api/msg_private_history`） |
| 返回体类型 | `MsgPrivateHistoryBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { msgPrivateHistory } from 'hana-music-api';

const result = await msgPrivateHistory(
  {
    uid: '9003',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/msg/private/history' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=9003'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                               |
| -------- | ------------------ | ---- | ------ | -------------------------------------------------- |
| `uid`    | `number \| string` | 是   | -      | 用户 id                                            |
| `limit`  | `number`           | 否   | `30`   | 返回数量，默认为 30                                |
| `before` | `number`           | 否   | `0`    | 分页参数，取上一页最后一项的 `time` 获取下一页数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MsgPrivateHistoryBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/msg_private_history`、`hana-music-api/schemas/msg_private_history` 导入运行时校验器）。

```ts
type MessageUser = Omit<UserProfile, 'userId' | 'expertTags'> & {
  userId?: number | null;
  expertTags?: Array<string> | null;
};

type MessageRecord = {
  id: number;
  batchId?: number | null;
  fromUser?: MessageUser | null;
  msg?: string | null;
  time?: number | null;
  toUser?: MessageUser | null;
};

type MsgPrivateHistoryBody = {
  code: 200;
  msgs: Array<MessageRecord>;
  hint?: string | null;
  isArtist?: boolean | null;
  isSubed?: boolean | null;
  more?: boolean | null;
};
```

- **公共类型**：[UserProfile](/api/shared-types#userprofile)

| 字段                         | 类型                   | 必填 | 说明                                                |
| ---------------------------- | ---------------------- | ---- | --------------------------------------------------- |
| `code`                       | `200`                  | 是   | 业务状态码（`200` 表示成功）                        |
| `msgs`                       | `Array<MessageRecord>` | 是   | 私信会话列表                                        |
| `msgs[].id`                  | `number`               | 是   | 记录 ID                                             |
| `msgs[].batchId`             | `number`               | 否   | batch ID                                            |
| `msgs[].fromUser`            | `MessageUser`          | 否   | 继承自 [UserProfile](/api/shared-types#userprofile) |
| `msgs[].fromUser.userId`     | `number`               | 否   | 用户 ID                                             |
| `msgs[].fromUser.expertTags` | `Array<string>`        | 否   | -                                                   |
| `msgs[].msg`                 | `string`               | 否   | 提示信息                                            |
| `msgs[].time`                | `number`               | 否   | 时间戳                                              |
| `msgs[].toUser`              | `MessageUser`          | 否   | 继承自 [UserProfile](/api/shared-types#userprofile) |
| `msgs[].toUser.userId`       | `number`               | 否   | 用户 ID                                             |
| `msgs[].toUser.expertTags`   | `Array<string>`        | 否   | -                                                   |
| `hint`                       | `string`               | 否   | -                                                   |
| `isArtist`                   | `boolean`              | 否   | -                                                   |
| `isSubed`                    | `boolean`              | 否   | -                                                   |
| `more`                       | `boolean`              | 否   | 是否还有更多数据                                    |

<!-- api-doc:response:end -->
