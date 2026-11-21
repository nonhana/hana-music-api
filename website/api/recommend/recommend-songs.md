---
title: '获取每日推荐歌曲'
description: '调用此接口，可获得每日推荐歌曲 ( 需要登录 )'
---

# 获取每日推荐歌曲

调用此接口，可获得每日推荐歌曲 ( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/recommend/songs`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `recommend_songs`                                        |
| SDK 函数   | `recommendSongs`（`hana-music-api/api/recommend_songs`） |
| 返回体类型 | `RecommendSongsBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { recommendSongs } from 'hana-music-api';

const result = await recommendSongs({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/recommend/songs' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RecommendSongsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/recommend_songs`、`hana-music-api/schemas/recommend_songs` 导入运行时校验器）。

```ts
type RecommendReason = {
  reason?: string | null;
  reasonId?: string | null;
  songId?: number | null;
};

type RecommendSongsBody = {
  code: 200;
  data: {
    dailySongs: Array<Song>;
    algReturnDemote?: boolean | null;
    demote?: boolean | null;
    fromCache?: boolean | null;
    recommendReasons?: Array<RecommendReason> | null;
  };
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段                               | 类型                                    | 必填 | 说明                         |
| ---------------------------------- | --------------------------------------- | ---- | ---------------------------- |
| `code`                             | `200`                                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                             | `object`                                | 是   | 接口返回的数据主体           |
| `data.dailySongs`                  | Array\<[Song](/api/shared-types#song)\> | 是   | Song 列表                    |
| `data.algReturnDemote`             | `boolean`                               | 否   | -                            |
| `data.demote`                      | `boolean`                               | 否   | -                            |
| `data.fromCache`                   | `boolean`                               | 否   | -                            |
| `data.recommendReasons`            | `Array<RecommendReason>`                | 否   | -                            |
| `data.recommendReasons[].reason`   | `string`                                | 否   | -                            |
| `data.recommendReasons[].reasonId` | `string`                                | 否   | reason ID                    |
| `data.recommendReasons[].songId`   | `number`                                | 否   | 歌曲 ID                      |

<!-- api-doc:response:end -->
