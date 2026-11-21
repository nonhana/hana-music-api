---
title: '电台订阅者列表'
description: '调用此接口，可获取电台订阅者列表'
---

# 电台订阅者列表

调用此接口，可获取电台订阅者列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/dj/subscriber`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `dj_subscriber`                                      |
| SDK 函数   | `djSubscriber`（`hana-music-api/api/dj_subscriber`） |
| 返回体类型 | `DjSubscriberBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djSubscriber } from 'hana-music-api';

const result = await djSubscriber({
  id: '335425050',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/subscriber' \
  --data-urlencode 'id=335425050'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明                                                              |
| ------- | ------------------ | ---- | ------ | ----------------------------------------------------------------- |
| `id`    | `number \| string` | 是   | -      | 电台 id                                                           |
| `limit` | `number`           | 否   | `20`   | 返回数量，默认为 20                                               |
| `time`  | `number`           | 否   | `-1`   | 分页参数，默认-1，传入上一次返回结果的 time，将会返回下一页的数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjSubscriberBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_subscriber`、`hana-music-api/schemas/dj_subscriber` 导入运行时校验器）。

```ts
type Subscriber = Omit<PlaylistUser, 'userId' | 'subscribeTime'> & {
  userId: number;
  subscribeTime?: number | null;
};

type DjSubscriberBody = {
  code: 200;
  subscribers: Array<Subscriber>;
  time?: number | null;
  hasMore?: boolean | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段                          | 类型                | 必填 | 说明                         |
| ----------------------------- | ------------------- | ---- | ---------------------------- |
| `code`                        | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `subscribers`                 | `Array<Subscriber>` | 是   | 订阅者列表                   |
| `subscribers[].userId`        | `number`            | 是   | 用户 ID                      |
| `subscribers[].subscribeTime` | `number`            | 否   | 时间戳                       |
| `time`                        | `number`            | 否   | 时间戳                       |
| `hasMore`                     | `boolean`           | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
