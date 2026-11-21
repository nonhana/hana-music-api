---
title: '获取相似歌单'
description: '调用此接口，传入歌曲 id，可获得相似歌单'
---

# 获取相似歌单

调用此接口，传入歌曲 id，可获得相似歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/simi/playlist`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `simi_playlist`                                      |
| SDK 函数   | `simiPlaylist`（`hana-music-api/api/simi_playlist`） |
| 返回体类型 | `SimiPlaylistBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { simiPlaylist } from 'hana-music-api';

const result = await simiPlaylist({
  id: '347230',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/simi/playlist' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                         |
| -------- | ------------------ | ---- | ------ | ---------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌曲 id                      |
| `limit`  | `number`           | 否   | `50`   | 返回数量，默认 `50`          |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SimiPlaylistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/simi_playlist`、`hana-music-api/schemas/simi_playlist` 导入运行时校验器）。

```ts
type PlaylistExtInfo = {
  coverImgId_str?: string | null;
};

type SimiPlaylist = Omit<
  PlaylistSummary,
  | 'alg'
  | 'backgroundImageId'
  | 'extProperties'
  | 'originalCoverId'
  | 'recommendReason'
  | 'tsSongCount'
  | 'xInfo'
> & {
  alg?: string | null;
  backgroundImageId?: number | null;
  extProperties?: PlaylistExtInfo | null;
  originalCoverId?: number | null;
  recommendReason?: string | null;
  tsSongCount?: number | null;
  xInfo?: PlaylistExtInfo | null;
};

type SimiPlaylistBody =
  | {
      code: 200;
      playlists: Array<SimiPlaylist>;
    }
  | '';
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段        | 类型                  | 必填 | 说明                         |
| ----------- | --------------------- | ---- | ---------------------------- |
| `code`      | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `playlists` | `Array<SimiPlaylist>` | 是   | 歌单列表                     |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->
