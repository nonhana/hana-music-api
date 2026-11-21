---
title: '获取点赞过的视频'
description: '调用此接口，可获取获取点赞过的视频'
---

# 获取点赞过的视频

调用此接口，可获取获取点赞过的视频

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/playlist/mylike`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `playlist_mylike`                                        |
| SDK 函数   | `playlistMylike`（`hana-music-api/api/playlist_mylike`） |
| 返回体类型 | `PlaylistMylikeBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistMylike } from 'hana-music-api';

const result = await playlistMylike(
  {
    time: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/mylike' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'time=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                      |
| ------- | -------- | ---- | ------ | ------------------------- |
| `time`  | `number` | 否   | `-1`   | 分页游标时间戳，默认 `-1` |
| `limit` | `number` | 否   | `12`   | 返回数量，默认 `12`       |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistMylikeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_mylike`、`hana-music-api/schemas/playlist_mylike` 导入运行时校验器）。

```ts
type PlaylistMylikeBody = {
  code: 200;
  message?: string | null;
  data: {
    more?: boolean | null;
    time?: number | null;
  };
};
```

| 字段        | 类型      | 必填 | 说明                         |
| ----------- | --------- | ---- | ---------------------------- |
| `code`      | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `message`   | `string`  | 否   | 返回说明信息                 |
| `data`      | `object`  | 是   | 接口返回的数据主体           |
| `data.more` | `boolean` | 否   | 是否还有更多数据             |
| `data.time` | `number`  | 否   | 时间戳                       |

<!-- api-doc:response:end -->
