---
title: '每日推荐歌曲-不感兴趣'
description: '日推歌曲标记为不感兴趣( 同时会返回一个新推荐歌曲，需要登录 )'
---

# 每日推荐歌曲-不感兴趣

日推歌曲标记为不感兴趣( 同时会返回一个新推荐歌曲，需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| 接口地址   | `/recommend/songs/dislike`                                              |
| 请求方式   | `GET` / `POST`                                                          |
| 需要登录   | 是                                                                      |
| 对应模块   | `recommend_songs_dislike`                                               |
| SDK 函数   | `recommendSongsDislike`（`hana-music-api/api/recommend_songs_dislike`） |
| 返回体类型 | `RecommendSongsDislikeBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { recommendSongsDislike } from 'hana-music-api';

const result = await recommendSongsDislike(
  {
    id: '168091',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/recommend/songs/dislike' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=168091'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌曲 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RecommendSongsDislikeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/recommend_songs_dislike`、`hana-music-api/schemas/recommend_songs_dislike` 导入运行时校验器）。

```ts
type RecommendSongsDislikeBody = {
  code: 200;
  data: Song;
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段   | 类型                           | 必填 | 说明                         |
| ------ | ------------------------------ | ---- | ---------------------------- |
| `code` | `200`                          | 是   | 业务状态码（`200` 表示成功） |
| `data` | [Song](/api/shared-types#song) | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
