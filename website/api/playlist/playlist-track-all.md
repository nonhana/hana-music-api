---
title: '获取歌单中的歌曲'
description: '先读取歌单中的歌曲 ID，再按 limit 和 offset 获取歌曲详情。'
---

# 获取歌单中的歌曲

这个模块先读取歌单详情中的 `trackIds`，选出指定范围的 ID，再请求这些歌曲的详情。一次调用包含两次上游读取，共用同一次调用的身份和总超时时间。

```mermaid
flowchart LR
  PLAYLIST["读取歌单详情"] --> IDS["取得 trackIds"]
  IDS --> PAGE["按 offset 和 limit 选择 ID"]
  PAGE --> SONGS["查询歌曲详情并返回"]
```

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/playlist/track/all`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 否（公开歌单可匿名访问，私有或完整列表需登录）                |
| 对应模块   | `playlist_track_all`                                          |
| SDK 函数   | `playlistTrackAll`（`hana-music-api/api/playlist_track_all`） |
| 返回体类型 | `PlaylistTrackAllBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistTrackAll } from 'hana-music-api';

const result = await playlistTrackAll({
  id: '24381616',
  limit: 50,
  offset: 0,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/track/all' \
  --data-urlencode 'id=24381616' \
  --data-urlencode 'limit=50' \
  --data-urlencode 'offset=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                 |
| -------- | ------------------ | ---- | ------ | ------------------------------------ |
| `id`     | `number \| string` | 是   | -      | 歌单 ID                              |
| `s`      | `number`           | 否   | `8`    | 传给上游歌单详情请求的收藏者数量参数 |
| `limit`  | `number`           | 否   | `1000` | 本次选择的歌曲数                     |
| `offset` | `number`           | 否   | `0`    | 从第几个 ID 开始，按零起算           |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistTrackAllBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_track_all`、`hana-music-api/schemas/playlist_track_all` 导入运行时校验器）。

```ts
type PlaylistTrackAllBody = {
  code: 200;
  songs: Array<Song>;
  privileges?: Array<LooseSongPrivilege> | null;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[Song](/api/shared-types#song)

| 字段         | 类型                                                                | 必填 | 说明                         |
| ------------ | ------------------------------------------------------------------- | ---- | ---------------------------- |
| `code`       | `200`                                                               | 是   | 业务状态码（`200` 表示成功） |
| `songs`      | Array\<[Song](/api/shared-types#song)\>                             | 是   | 歌曲列表                     |
| `privileges` | Array\<[LooseSongPrivilege](/api/shared-types#loosesongprivilege)\> | 否   | 歌曲播放与下载权限列表       |

<!-- api-doc:response:end -->

## 注意事项

- **两阶段请求**：模块先请求歌单详情获取 `trackIds` 并按 `limit`/`offset` 切片，再批量请求歌曲详情返回最终结果。
