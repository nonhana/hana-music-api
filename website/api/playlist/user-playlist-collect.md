---
title: '用户的收藏歌单列表'
description: '调用此接口，传入用户id，获取用户的收藏歌单列表'
---

# 用户的收藏歌单列表

调用此接口，传入用户id，获取用户的收藏歌单列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/user/playlist/collect`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 否                                                                  |
| 对应模块   | `user_playlist_collect`                                             |
| SDK 函数   | `userPlaylistCollect`（`hana-music-api/api/user_playlist_collect`） |
| 返回体类型 | `UserPlaylistCollectBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userPlaylistCollect } from 'hana-music-api';

const result = await userPlaylistCollect({
  uid: '32953014',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/playlist/collect' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                     |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------ |
| `uid`    | `number \| string` | 是   | -      | 用户 id                                                                  |
| `limit`  | `number`           | 否   | `100`  | 返回数量，默认为 100                                                     |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页 ，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserPlaylistCollectBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_playlist_collect`、`hana-music-api/schemas/user_playlist_collect` 导入运行时校验器）。

```ts
type UserPlaylistCollectBody = {
  code: 200;
  data: {
    count?: number | null;
    more?: boolean | null;
    playlist: Array<PlaylistSummary>;
  };
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段            | 类型                                                          | 必填 | 说明                         |
| --------------- | ------------------------------------------------------------- | ---- | ---------------------------- |
| `code`          | `200`                                                         | 是   | 业务状态码（`200` 表示成功） |
| `data`          | `object`                                                      | 是   | 接口返回的数据主体           |
| `data.count`    | `number`                                                      | 否   | 条目总数                     |
| `data.more`     | `boolean`                                                     | 否   | 是否还有更多数据             |
| `data.playlist` | Array\<[PlaylistSummary](/api/shared-types#playlistsummary)\> | 是   | 歌单详情                     |

<!-- api-doc:response:end -->
