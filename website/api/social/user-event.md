---
title: '获取用户动态'
description: '登录后调用此接口，传入用户 id，可以获取用户动态'
---

# 获取用户动态

登录后调用此接口，传入用户 id，可以获取用户动态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/user/event`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `user_event`                                   |
| SDK 函数   | `userEvent`（`hana-music-api/api/user_event`） |
| 返回体类型 | `UserEventBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userEvent } from 'hana-music-api';

const result = await userEvent(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/event' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                                                                                |
| ---------- | ------------------ | ---- | ------ | ----------------------------------------------------------------------------------- |
| `uid`      | `number \| string` | 是   | -      | 用户 id                                                                             |
| `limit`    | `number`           | 否   | `30`   | 返回数量，默认为 30                                                                 |
| `offset`   | `number`           | 否   | -      | 偏移数量，用于分页，默认 `0`                                                        |
| `lasttime` | `number`           | 否   | `-1`   | 返回数据的 `lasttime` ，默认-1，传入上一次返回结果的 lasttime，将会返回下一页的数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserEventBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_event`、`hana-music-api/schemas/user_event` 导入运行时校验器）。

```ts
type EventRecord = {
  id: number;
  actId?: number | null;
  actName?: string | null;
  aiPrivatePic?: boolean | null;
  canShare?: boolean | null;
  containAiContent?: boolean | null;
  discussId?: string | null;
  encryptUserId?: string | null;
  eventTime?: number | null;
  expireTime?: number | null;
  extType?: string | null;
  firstEditTime?: number | null;
  forwardCount?: number | null;
  info?: EventInfo | null;
  insiteForwardCount?: number | null;
  ipLocation?: EventIpLocation | null;
  json?: string | null;
  more?: boolean | null;
  musicianSay?: boolean | null;
  needAiDefaultPic?: boolean | null;
  owner?: boolean | null;
  pics?: Array<EventPic> | null;
  relationTopic?: boolean | null;
  resourceUniqueId?: string | null;
  showFollowButton?: boolean | null;
  showTime?: number | null;
  songPlayStyle?: string | null;
  threadId?: string | null;
  tmplId?: number | null;
  type?: number | null;
  typeDesc?: string | null;
  user?: EventUser | null;
};

type UserEventBody = {
  code: 200;
  events: Array<EventRecord>;
  lasttime?: number | null;
  more?: boolean | null;
  size?: number | null;
};
```

- **公共类型**：[EventInfo](/api/shared-types#eventinfo)、[EventIpLocation](/api/shared-types#eventiplocation)、[EventPic](/api/shared-types#eventpic)、[EventUser](/api/shared-types#eventuser)

| 字段       | 类型                 | 必填 | 说明                         |
| ---------- | -------------------- | ---- | ---------------------------- |
| `code`     | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `events`   | `Array<EventRecord>` | 是   | 动态列表                     |
| `lasttime` | `number`             | 否   | 下一页游标时间戳             |
| `more`     | `boolean`            | 否   | 是否还有更多数据             |
| `size`     | `number`             | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **动态类型枚举**：返回事件 `type` 常见取值包括 `18` 分享单曲、`19` 分享专辑、`17`/`28` 分享电台节目、`22` 转发、`39` 发布视频、`35`/`13` 分享歌单、`24` 分享专栏、`41`/`21` 分享视频。
