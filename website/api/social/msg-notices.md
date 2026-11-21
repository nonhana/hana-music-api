---
title: '通知 - 通知'
description: '登录后调用此接口 ，可获取通知'
---

# 通知 - 通知

登录后调用此接口 ，可获取通知

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/msg/notices`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `msg_notices`                                    |
| SDK 函数   | `msgNotices`（`hana-music-api/api/msg_notices`） |
| 返回体类型 | `MsgNoticesBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { msgNotices } from 'hana-music-api';

const result = await msgNotices(
  {
    limit: 3,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/msg/notices' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=3'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明                                                                        |
| ---------- | -------- | ---- | ------ | --------------------------------------------------------------------------- |
| `limit`    | `number` | 否   | `30`   | 返回数量，默认为 30                                                         |
| `lasttime` | `number` | 否   | `-1`   | 返回数据的 `time` ，默认-1，传入上一次返回结果的 time，将会返回下一页的数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MsgNoticesBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/msg_notices`、`hana-music-api/schemas/msg_notices` 导入运行时校验器）。

```ts
type NoticeRecord = {
  id: number;
  notice?: string | null;
  queued?: boolean | null;
  time?: number | null;
  type?: number | null;
  userId?: number | null;
};

type MsgNoticesBody = {
  code: 200;
  notices: Array<NoticeRecord>;
  lastTime?: number | null;
  more?: boolean | null;
};
```

| 字段               | 类型                  | 必填 | 说明                         |
| ------------------ | --------------------- | ---- | ---------------------------- |
| `code`             | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `notices`          | `Array<NoticeRecord>` | 是   | 系统通知列表                 |
| `notices[].id`     | `number`              | 是   | 记录 ID                      |
| `notices[].notice` | `string`              | 否   | -                            |
| `notices[].queued` | `boolean`             | 否   | -                            |
| `notices[].time`   | `number`              | 否   | 时间戳                       |
| `notices[].type`   | `number`              | 否   | -                            |
| `notices[].userId` | `number`              | 否   | 用户 ID                      |
| `lastTime`         | `number`              | 否   | 下一页游标时间戳             |
| `more`             | `boolean`             | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
