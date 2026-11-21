---
title: '歌曲是否喜爱'
description: '登录后调用此接口，传入歌曲id，可判断歌曲是否被喜爱;'
---

# 歌曲是否喜爱

登录后调用此接口，传入歌曲id，可判断歌曲是否被喜爱;

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/song/like/check`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 是                                                      |
| 对应模块   | `song_like_check`                                       |
| SDK 函数   | `songLikeCheck`（`hana-music-api/api/song_like_check`） |
| 返回体类型 | `SongLikeCheckBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songLikeCheck } from 'hana-music-api';

const result = await songLikeCheck(
  {
    ids: [347230],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/song/like/check' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明         |
| ----- | ------------------------- | ---- | ------ | ------------ |
| `ids` | `Array<number \| string>` | 是   | -      | 歌曲 id 列表 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongLikeCheckBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_like_check`、`hana-music-api/schemas/song_like_check` 导入运行时校验器）。

```ts
type SongLikeCheckBody = {
  code: 200;
  ids: Array<number>;
};
```

| 字段   | 类型            | 必填 | 说明                         |
| ------ | --------------- | ---- | ---------------------------- |
| `code` | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `ids`  | `Array<number>` | 是   | -                            |

<!-- api-doc:response:end -->
