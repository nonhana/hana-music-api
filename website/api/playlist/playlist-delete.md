---
title: '删除歌单'
description: '调用此接口，传入歌单 id 可删除歌单'
---

# 删除歌单

调用此接口，传入歌单 id 可删除歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/playlist/delete`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `playlist_delete`                                        |
| SDK 函数   | `playlistDelete`（`hana-music-api/api/playlist_delete`） |
| 返回体类型 | `PlaylistDeleteBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistDelete } from 'hana-music-api';

const result = await playlistDelete(
  {
    id: '2947311456',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/delete' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=2947311456'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型                                          | 必填 | 默认值 | 说明                        |
| ---- | --------------------------------------------- | ---- | ------ | --------------------------- |
| `id` | `number \| string \| Array<number \| string>` | 是   | -      | 歌单 id，可多个，用逗号隔开 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistDeleteBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_delete`、`hana-music-api/schemas/playlist_delete` 导入运行时校验器）。

```ts
type PlaylistDeleteBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
