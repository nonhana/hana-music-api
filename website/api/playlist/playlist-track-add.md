---
title: '收藏视频到视频歌单'
description: '调用此接口，可收藏视频到视频歌单 ( 需要登录 )'
---

# 收藏视频到视频歌单

调用此接口，可收藏视频到视频歌单 ( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/playlist/track/add`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 是                                                            |
| 对应模块   | `playlist_track_add`                                          |
| SDK 函数   | `playlistTrackAdd`（`hana-music-api/api/playlist_track_add`） |
| 返回体类型 | `PlaylistTrackAddBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistTrackAdd } from 'hana-music-api';

const result = await playlistTrackAdd(
  {
    pid: 5271999357,
    ids: [186041],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/track/add' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"pid":5271999357,"ids":[186041]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明                       |
| ----- | ------------------------- | ---- | ------ | -------------------------- |
| `pid` | `number \| string`        | 是   | -      | 目标歌单 ID                |
| `ids` | `Array<number \| string>` | 是   | -      | 要添加到歌单的歌曲 ID 数组 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistTrackAddBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_track_add`、`hana-music-api/schemas/playlist_track_add` 导入运行时校验器）。

```ts
type PlaylistTrackAddBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
