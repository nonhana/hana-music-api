---
title: '通知 - @我'
description: '登录后调用此接口 ，可获取@我数据'
---

# 通知 - @我

登录后调用此接口 ，可获取@我数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/msg/forwards`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `msg_forwards`                                     |
| SDK 函数   | `msgForwards`（`hana-music-api/api/msg_forwards`） |
| 返回体类型 | `MsgForwardsBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { msgForwards } from 'hana-music-api';

const result = await msgForwards(
  {
    limit: 3,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/msg/forwards' \
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

返回体类型：`MsgForwardsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/msg_forwards`、`hana-music-api/schemas/msg_forwards` 导入运行时校验器）。

```ts
type ForwardOrigin = {
  forwards?: string | null;
  id?: number | null;
  json?: string | null;
  time?: number | null;
  type?: number | null;
  userId?: number | null;
};

type ForwardRecord = {
  id: number;
  json?: string | null;
  resourceExist?: boolean | null;
  time?: number | null;
  type?: number | null;
  uf?: ForwardOrigin | null;
  userId?: number | null;
};

type MsgForwardsBody = {
  code: 200;
  forwards: Array<ForwardRecord>;
  lasttime?: number | null;
  more?: boolean | null;
  newCount?: number | null;
};
```

| 字段                       | 类型                   | 必填 | 说明                         |
| -------------------------- | ---------------------- | ---- | ---------------------------- |
| `code`                     | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `forwards`                 | `Array<ForwardRecord>` | 是   | @我 转发列表                 |
| `forwards[].id`            | `number`               | 是   | 记录 ID                      |
| `forwards[].json`          | `string`               | 否   | -                            |
| `forwards[].resourceExist` | `boolean`              | 否   | -                            |
| `forwards[].time`          | `number`               | 否   | 时间戳                       |
| `forwards[].type`          | `number`               | 否   | -                            |
| `forwards[].uf`            | `ForwardOrigin`        | 否   | -                            |
| `forwards[].uf.forwards`   | `string`               | 否   | @我 转发列表                 |
| `forwards[].uf.id`         | `number`               | 否   | 记录 ID                      |
| `forwards[].uf.json`       | `string`               | 否   | -                            |
| `forwards[].uf.time`       | `number`               | 否   | 时间戳                       |
| `forwards[].uf.type`       | `number`               | 否   | -                            |
| `forwards[].uf.userId`     | `number`               | 否   | 用户 ID                      |
| `forwards[].userId`        | `number`               | 否   | 用户 ID                      |
| `lasttime`                 | `number`               | 否   | 下一页游标时间戳             |
| `more`                     | `boolean`              | 否   | 是否还有更多数据             |
| `newCount`                 | `number`               | 否   | -                            |

<!-- api-doc:response:end -->
