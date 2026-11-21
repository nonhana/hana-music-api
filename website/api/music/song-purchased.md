---
title: '已购单曲'
description: '登录后调用此接口可获取已购买的单曲'
---

# 已购单曲

登录后调用此接口可获取已购买的单曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/song/purchased`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `song_purchased`                                       |
| SDK 函数   | `songPurchased`（`hana-music-api/api/song_purchased`） |
| 返回体类型 | `SongPurchasedBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songPurchased } from 'hana-music-api';

const result = await songPurchased(
  {
    limit: 10,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/purchased' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                              |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------- |
| `limit`  | `number` | 否   | `20`   | 取出评论数量，默认为 20                                           |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*10，其中 10 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongPurchasedBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_purchased`、`hana-music-api/schemas/song_purchased` 导入运行时校验器）。

```ts
type SongPurchasedBody = {
  code: 200;
  data: {
    count?: number | null;
    hasMore?: boolean | null;
  };
  message?: string | null;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `object`  | 是   | 接口返回的数据主体           |
| `data.count`   | `number`  | 否   | 条目总数                     |
| `data.hasMore` | `boolean` | 否   | 是否还有更多数据             |
| `message`      | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
