---
title: '获取歌单详情'
description: '歌单能看到歌单名字，但看不到具体歌单内容，调用此接口，传入歌单 id，可'
---

# 获取歌单详情

歌单能看到歌单名字，但看不到具体歌单内容，调用此接口，传入歌单 id，可

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| 接口地址   | `/playlist/detail`                                                                |
| 请求方式   | `GET` / `POST`                                                                    |
| 需要登录   | 否                                                                                |
| 对应模块   | `playlist_detail`                                                                 |
| SDK 函数   | `playlistDetail`（`hana-music-api/api/playlist_detail`）                          |
| 返回体类型 | `PlaylistDetailBody`（已建模返回体）                                              |
| 读缓存     | 支持共享读缓存与并发请求去重，详见 [缓存与身份池](/guide/cache-and-identity-pool) |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistDetail } from 'hana-music-api';

const result = await playlistDetail({
  id: '24381616',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/detail' \
  --data-urlencode 'id=24381616'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                            |
| ---- | ------------------ | ---- | ------ | ------------------------------- |
| `id` | `number \| string` | 是   | -      | 歌单 id                         |
| `s`  | `number`           | 否   | `8`    | 歌单最近的 s 个收藏者，默认为 8 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_detail`、`hana-music-api/schemas/playlist_detail` 导入运行时校验器）。

```ts
type Playlist = Omit<PlaylistSummary, 'trackIds'> & {
  trackIds: Array<{
    id: number;
  }>;
};

type PlaylistDetailBody = {
  code: 200;
  playlist: Playlist;
  fromUserCount?: number | null;
  privileges?: Array<LooseSongPrivilege> | null;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                | 类型                                                                | 必填 | 说明                         |
| ------------------- | ------------------------------------------------------------------- | ---- | ---------------------------- |
| `code`              | `200`                                                               | 是   | 业务状态码（`200` 表示成功） |
| `playlist`          | `Playlist`                                                          | 是   | 歌单详情                     |
| `playlist.trackIds` | `Array<object>`                                                     | 是   | 曲目 ID 列表                 |
| `fromUserCount`     | `number`                                                            | 否   | -                            |
| `privileges`        | Array\<[LooseSongPrivilege](/api/shared-types#loosesongprivilege)\> | 否   | 歌曲播放与下载权限列表       |

<!-- api-doc:response:end -->

## 注意事项

- **读缓存与并发请求去重**：本接口支持共享读缓存与并发请求去重，未声明的请求字段会在输入校验时被拒绝，详见 [缓存与身份池](/guide/cache-and-identity-pool)。
- **曲目列表完整性**：未登录或歌单曲目较多时，`playlist.tracks` 可能只包含部分曲目；`playlist.trackIds` 包含完整的曲目 ID 列表，可配合 [获取歌曲详情](/api/music/song-detail) 批量拉取全部歌曲信息。
- **登录态识别**：当登录 Cookie 失效回落到游客视角时，`playlist.subscribed` 会返回 `null`。
