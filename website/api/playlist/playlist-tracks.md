---
title: '对歌单添加或删除歌曲'
description: '调用此接口，可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )'
---

# 对歌单添加或删除歌曲

调用此接口，可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/playlist/tracks`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `playlist_tracks`                                        |
| SDK 函数   | `playlistTracks`（`hana-music-api/api/playlist_tracks`） |
| 返回体类型 | `PlaylistTracksBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistTracks } from 'hana-music-api';

const result = await playlistTracks(
  {
    op: 'add',
    pid: 24381616,
    tracks: [347231],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/tracks' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"op":"add","pid":24381616,"tracks":[347231]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                      | 必填 | 默认值   | 说明                                                                                   |
| -------- | ------------------------- | ---- | -------- | -------------------------------------------------------------------------------------- |
| `op`     | `'add' \| 'del'`          | 是   | -        | 从歌单增加单曲为 add，删除为 del                                                       |
| `pid`    | `number \| string`        | 是   | -        | 歌单 id                                                                                |
| `tracks` | `Array<number \| string>` | 是   | -        | 歌曲 id 数组                                                                           |
| `step`   | `'initial' \| 'fallback'` | 否   | 自动模式 | 分步模式：`initial` 仅发首次请求；`fallback` 直接发后备请求；省略时在 `512` 后自动后备 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistTracksBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_tracks`、`hana-music-api/schemas/playlist_tracks` 导入运行时校验器）。

```ts
type PlaylistTracksBody = {
  code: 200;
  count?: number | null;
  cloudCount?: number | null;
  trackIds?: string | null;
};
```

| 字段         | 类型     | 必填 | 说明                         |
| ------------ | -------- | ---- | ---------------------------- |
| `code`       | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `count`      | `number` | 否   | 条目总数                     |
| `cloudCount` | `number` | 否   | 云盘曲目数                   |
| `trackIds`   | `string` | 否   | 曲目 ID 列表                 |

<!-- api-doc:response:end -->

## 注意事项

- **分步后备机制**：省略 `step` 时，若首次操作返回业务码 `512`，SDK 会自动将 `tracks` 重复追加发送一次后备请求。
- **手动分步控制**：传入 `step: 'initial'` 时遇到 `512` 会直接失败返回，可由应用自行决定后续是否传入 `step: 'fallback'`（如重新获取 `checkToken` 后执行）；分步调用不共享历史状态，也不提供跨调用事务或回滚。
- **令牌配置**：自动模式下如需 `checkToken`，请传入异步 provider 函数以支持逐请求获取新令牌，详见 [SDK 使用指南](/guide/sdk-usage)。
