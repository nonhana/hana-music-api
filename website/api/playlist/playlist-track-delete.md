---
title: '删除视频歌单里的视频'
description: '调用此接口，可删除视频歌单里的视频 ( 需要登录 )'
---

# 删除视频歌单里的视频

调用此接口，可删除视频歌单里的视频 ( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/playlist/track/delete`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 是                                                                  |
| 对应模块   | `playlist_track_delete`                                             |
| SDK 函数   | `playlistTrackDelete`（`hana-music-api/api/playlist_track_delete`） |
| 返回体类型 | `PlaylistTrackDeleteBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistTrackDelete } from 'hana-music-api';

const result = await playlistTrackDelete(
  {
    id: 347230,
    ids: [347230],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/track/delete' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"id":347230,"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明                         |
| ----- | ------------------------- | ---- | ------ | ---------------------------- |
| `id`  | `number \| string`        | 是   | -      | 目标歌单 ID                  |
| `ids` | `Array<number \| string>` | 是   | -      | 要从歌单中移除的歌曲 ID 数组 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistTrackDeleteBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_track_delete`、`hana-music-api/schemas/playlist_track_delete` 导入运行时校验器）。

```ts
type PlaylistTrackDeleteBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
