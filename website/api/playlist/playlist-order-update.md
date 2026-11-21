---
title: '调整歌单顺序'
description: '登录后调用此接口，可以根据歌单 id 顺序调整歌单顺序'
---

# 调整歌单顺序

登录后调用此接口，可以根据歌单 id 顺序调整歌单顺序

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/playlist/order/update`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 是                                                                  |
| 对应模块   | `playlist_order_update`                                             |
| SDK 函数   | `playlistOrderUpdate`（`hana-music-api/api/playlist_order_update`） |
| 返回体类型 | `PlaylistOrderUpdateBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistOrderUpdate } from 'hana-music-api';

const result = await playlistOrderUpdate(
  {
    ids: [111, 222],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/order/update' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"ids":[111,222]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明                       |
| ----- | ------------------------- | ---- | ------ | -------------------------- |
| `ids` | `Array<number \| string>` | 是   | -      | 歌单 id 数组，顺序即新顺序 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistOrderUpdateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_order_update`、`hana-music-api/schemas/playlist_order_update` 导入运行时校验器）。

```ts
type PlaylistOrderUpdateBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
