---
title: '获取动态列表'
description: '调用此接口，可获取各种动态，对应网页版网易云，朋友界面里的各种动态消息'
---

# 获取动态列表

调用此接口，可获取各种动态，对应网页版网易云，朋友界面里的各种动态消息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                    |
| ---------- | ------------------------------------- |
| 接口地址   | `/event`                              |
| 请求方式   | `GET` / `POST`                        |
| 需要登录   | 否                                    |
| 对应模块   | `event`                               |
| SDK 函数   | `event`（`hana-music-api/api/event`） |
| 返回体类型 | `EventBody`（已建模返回体）           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { event } from 'hana-music-api';

const result = await event({
  pagesize: 30,
  lasttime: 1556740526369,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/event' \
  --data-urlencode 'pagesize=30' \
  --data-urlencode 'lasttime=1556740526369'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明                                                                                |
| ---------- | -------- | ---- | ------ | ----------------------------------------------------------------------------------- |
| `pagesize` | `number` | 否   | `20`   | 每页数据，默认 20                                                                   |
| `lasttime` | `number` | 否   | `-1`   | 返回数据的 `lasttime` ，默认-1，传入上一次返回结果的 lasttime，将会返回下一页的数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`EventBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/event`、`hana-music-api/schemas/event` 导入运行时校验器）。

```ts
type EventRecord = {
  id: number;
  actId?: number | null;
  actName?: string | null;
  aiPrivatePic?: boolean | null;
  canShare?: boolean | null;
  containAiContent?: boolean | null;
  contentDeclaration?: string | null;
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
  privacySetting?: number | null;
  relationTopic?: boolean | null;
  repostSource?: string | null;
  resourceUniqueId?: string | null;
  showFollowButton?: boolean | null;
  showTime?: number | null;
  songPlayStyle?: string | null;
  threadId?: string | null;
  tmplId?: number | null;
  topEvent?: boolean | null;
  type?: number | null;
  typeDesc?: string | null;
  user?: EventUser | null;
  uuid?: string | null;
};

type EventBody = {
  code: 200;
  event: Array<EventRecord>;
  lasttime?: number | null;
  more?: boolean | null;
};
```

- **公共类型**：[EventInfo](/api/shared-types#eventinfo)、[EventIpLocation](/api/shared-types#eventiplocation)、[EventPic](/api/shared-types#eventpic)、[EventUser](/api/shared-types#eventuser)

| 字段       | 类型                 | 必填 | 说明                         |
| ---------- | -------------------- | ---- | ---------------------------- |
| `code`     | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `event`    | `Array<EventRecord>` | 是   | 动态列表                     |
| `lasttime` | `number`             | 否   | 下一页游标时间戳             |
| `more`     | `boolean`            | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
