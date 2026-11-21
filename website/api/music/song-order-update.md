---
title: '调整歌曲顺序'
description: '登录后调用此接口，可以根据歌曲 id 顺序调整歌曲顺序'
---

# 调整歌曲顺序

登录后调用此接口，可以根据歌曲 id 顺序调整歌曲顺序

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/song/order/update`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 是                                                          |
| 对应模块   | `song_order_update`                                         |
| SDK 函数   | `songOrderUpdate`（`hana-music-api/api/song_order_update`） |
| 返回体类型 | `SongOrderUpdateBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songOrderUpdate } from 'hana-music-api';

const result = await songOrderUpdate(
  {
    ids: [347230],
    pid: 24381616,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/song/order/update' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"ids":[347230],"pid":24381616}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明         |
| ----- | ------------------------- | ---- | ------ | ------------ |
| `ids` | `Array<number \| string>` | 是   | -      | 歌曲 id 列表 |
| `pid` | `number \| string`        | 是   | -      | 歌单 id      |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongOrderUpdateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_order_update`、`hana-music-api/schemas/song_order_update` 导入运行时校验器）。

```ts
type SongOrderUpdateBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
