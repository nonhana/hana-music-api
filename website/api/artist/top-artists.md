---
title: '热门歌手'
description: '调用此接口，可获取热门歌手数据'
---

# 热门歌手

调用此接口，可获取热门歌手数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/top/artists`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `top_artists`                                    |
| SDK 函数   | `topArtists`（`hana-music-api/api/top_artists`） |
| 返回体类型 | `TopArtistsBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topArtists } from 'hana-music-api';

const result = await topArtists({
  offset: 0,
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/artists' \
  --data-urlencode 'offset=0' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                        |
| -------- | -------- | ---- | ------ | --------------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `50`   | 取出数量，默认为 50                                                         |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*50，其中 50 为 limit 的值，默认<br>为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopArtistsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_artists`、`hana-music-api/schemas/top_artists` 导入运行时校验器）。

```ts
type ChartArtist = Omit<Artist, 'id' | 'fansCount'> & {
  id: number;
  fansCount?: number | null;
};

type TopArtistsBody = {
  code: 200;
  artists: Array<ChartArtist>;
  more?: boolean | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段                  | 类型                 | 必填 | 说明                         |
| --------------------- | -------------------- | ---- | ---------------------------- |
| `code`                | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `artists`             | `Array<ChartArtist>` | 是   | 歌手列表                     |
| `artists[].id`        | `number`             | 是   | 记录 ID                      |
| `artists[].fansCount` | `number`             | 否   | -                            |
| `more`                | `boolean`            | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
