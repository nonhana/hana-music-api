---
title: '歌单收藏者'
description: '调用此接口，传入歌单 id 可获取歌单的所有收藏者'
---

# 歌单收藏者

调用此接口，传入歌单 id 可获取歌单的所有收藏者

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                 |
| ---------- | ------------------------------------------------------------------ |
| 接口地址   | `/playlist/subscribers`                                            |
| 请求方式   | `GET` / `POST`                                                     |
| 需要登录   | 否                                                                 |
| 对应模块   | `playlist_subscribers`                                             |
| SDK 函数   | `playlistSubscribers`（`hana-music-api/api/playlist_subscribers`） |
| 返回体类型 | `PlaylistSubscribersBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistSubscribers } from 'hana-music-api';

const result = await playlistSubscribers({
  id: '544215255',
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/subscribers' \
  --data-urlencode 'id=544215255' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                              |
| -------- | ------------------ | ---- | ------ | ----------------------------------------------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌单 id                                                           |
| `limit`  | `number`           | 否   | `20`   | 取出评论数量，默认为 20                                           |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*20，其中 20 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistSubscribersBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_subscribers`、`hana-music-api/schemas/playlist_subscribers` 导入运行时校验器）。

```ts
type Subscriber = Omit<PlaylistUser, 'userId' | 'subscribeTime'> & {
  userId: number;
  subscribeTime?: number | null;
};

type PlaylistSubscribersBody = {
  code: 200;
  subscribers: Array<Subscriber>;
  total?: number | null;
  more?: boolean | null;
  reason?: string | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段                          | 类型                | 必填 | 说明                         |
| ----------------------------- | ------------------- | ---- | ---------------------------- |
| `code`                        | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `subscribers`                 | `Array<Subscriber>` | 是   | 订阅者列表                   |
| `subscribers[].userId`        | `number`            | 是   | 用户 ID                      |
| `subscribers[].subscribeTime` | `number`            | 否   | 时间戳                       |
| `total`                       | `number`            | 否   | 总条目数                     |
| `more`                        | `boolean`           | 否   | 是否还有更多数据             |
| `reason`                      | `string`            | 否   | -                            |

<!-- api-doc:response:end -->
