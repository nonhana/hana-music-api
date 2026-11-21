---
title: '新建歌单'
description: '调用此接口，传入歌单名字可新建歌单'
---

# 新建歌单

调用此接口，传入歌单名字可新建歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/playlist/create`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `playlist_create`                                        |
| SDK 函数   | `playlistCreate`（`hana-music-api/api/playlist_create`） |
| 返回体类型 | `PlaylistCreateBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistCreate } from 'hana-music-api';

const result = await playlistCreate(
  {
    name: '测试歌单',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/create' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'name=测试歌单'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型                              | 必填 | 默认值   | 说明                                                                    |
| --------- | --------------------------------- | ---- | -------- | ----------------------------------------------------------------------- |
| `name`    | `string`                          | 是   | -        | 歌单名                                                                  |
| `privacy` | `0 \| 10`                         | 否   | `0`      | 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单                      |
| `type`    | `'NORMAL' \| 'VIDEO' \| 'SHARED'` | 否   | `NORMAL` | 歌单类型，默认'NORMAL'，传 'VIDEO'则为视频歌单，传 'SHARED'则为共享歌单 |

| `privacy` | 隐私设置             |
| --------- | -------------------- |
| `0`       | 普通公开歌单（默认） |
| `10`      | 隐私歌单             |

| `type`   | 歌单类型         |
| -------- | ---------------- |
| `NORMAL` | 普通歌单（默认） |
| `VIDEO`  | 视频歌单         |
| `SHARED` | 共享歌单         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistCreateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_create`、`hana-music-api/schemas/playlist_create` 导入运行时校验器）。

```ts
type PlaylistCreateBody = {
  code: 200;
  id: number;
  playlist: PlaylistSummary;
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段       | 类型                                                 | 必填 | 说明                         |
| ---------- | ---------------------------------------------------- | ---- | ---------------------------- |
| `code`     | `200`                                                | 是   | 业务状态码（`200` 表示成功） |
| `id`       | `number`                                             | 是   | 记录 ID                      |
| `playlist` | [PlaylistSummary](/api/shared-types#playlistsummary) | 是   | 歌单详情                     |

<!-- api-doc:response:end -->
