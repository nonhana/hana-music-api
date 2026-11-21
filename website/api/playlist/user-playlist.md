---
title: '获取用户歌单'
description: '登录后调用此接口，传入用户 id，可以获取用户歌单'
---

# 获取用户歌单

登录后调用此接口，传入用户 id，可以获取用户歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/user/playlist`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `user_playlist`                                      |
| SDK 函数   | `userPlaylist`（`hana-music-api/api/user_playlist`） |
| 返回体类型 | `UserPlaylistBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userPlaylist } from 'hana-music-api';

const result = await userPlaylist(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/playlist' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                    |
| -------- | ------------------ | ---- | ------ | ----------------------------------------------------------------------- |
| `uid`    | `number \| string` | 是   | -      | 用户 id                                                                 |
| `limit`  | `number`           | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserPlaylistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_playlist`、`hana-music-api/schemas/user_playlist` 导入运行时校验器）。

```ts
type UserPlaylistBody = {
  code: 200;
  more?: boolean | null;
  playlist: Array<PlaylistSummary>;
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段       | 类型                                                          | 必填 | 说明                         |
| ---------- | ------------------------------------------------------------- | ---- | ---------------------------- |
| `code`     | `200`                                                         | 是   | 业务状态码（`200` 表示成功） |
| `more`     | `boolean`                                                     | 否   | 是否还有更多数据             |
| `playlist` | Array\<[PlaylistSummary](/api/shared-types#playlistsummary)\> | 是   | 歌单详情                     |

<!-- api-doc:response:end -->
