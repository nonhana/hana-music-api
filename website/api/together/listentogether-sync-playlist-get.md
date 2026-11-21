---
title: '一起听 - 获取同步歌单'
description: '获取一起听房间当前同步的播放列表快照。'
---

# 一起听 - 获取同步歌单

获取一起听房间当前同步的播放列表快照。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| 接口地址   | `/listentogether/sync/playlist/get`                                                      |
| 请求方式   | `GET` / `POST`                                                                           |
| 需要登录   | 是                                                                                       |
| 对应模块   | `listentogether_sync_playlist_get`                                                       |
| SDK 函数   | `listentogetherSyncPlaylistGet`（`hana-music-api/api/listentogether_sync_playlist_get`） |
| 返回体类型 | `ListentogetherSyncPlaylistGetBody`（已建模返回体）                                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherSyncPlaylistGet } from 'hana-music-api';

const result = await listentogetherSyncPlaylistGet(
  {
    roomId: 'MzA0NjY5...',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listentogether/sync/playlist/get' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'roomId=MzA0NjY5...'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明    |
| -------- | -------- | ---- | ------ | ------- |
| `roomId` | `string` | 是   | -      | 房间 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherSyncPlaylistGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_sync_playlist_get`、`hana-music-api/schemas/listentogether_sync_playlist_get` 导入运行时校验器）。

```ts
type ListentogetherSyncPlaylistGetBody = {
  code: 200;
  data: Record<string, UnknownJson>;
  message?: string | null;
};
```

| 字段      | 类型                          | 必填 | 说明                         |
| --------- | ----------------------------- | ---- | ---------------------------- |
| `code`    | `200`                         | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `Record<string, UnknownJson>` | 是   | 接口返回的数据主体           |
| `message` | `string`                      | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **详情补全**：返回的列表快照包含歌曲 ID 列表（如 `data.playlist.displayList.result`），如需完整歌曲信息请再调用 [获取歌曲详情](/api/music/song-detail)。
