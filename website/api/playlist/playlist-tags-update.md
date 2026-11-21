---
title: '更新歌单标签'
description: '登录后调用此接口，可以单独更新用户歌单标签'
---

# 更新歌单标签

登录后调用此接口，可以单独更新用户歌单标签

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                |
| ---------- | ----------------------------------------------------------------- |
| 接口地址   | `/playlist/tags/update`                                           |
| 请求方式   | `GET` / `POST`                                                    |
| 需要登录   | 是                                                                |
| 对应模块   | `playlist_tags_update`                                            |
| SDK 函数   | `playlistTagsUpdate`（`hana-music-api/api/playlist_tags_update`） |
| 返回体类型 | `PlaylistTagsUpdateBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistTagsUpdate } from 'hana-music-api';

const result = await playlistTagsUpdate(
  {
    id: 24381616,
    tags: ['学习'],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/tags/update' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"id":24381616,"tags":["学习"]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                       |
| ------ | ------------------ | ---- | ------ | ------------------------------------------ |
| `id`   | `number \| string` | 是   | -      | 歌单 id                                    |
| `tags` | `Array<string>`    | 是   | -      | 歌单标签；空数组表示清空，成员不能包含分号 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistTagsUpdateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_tags_update`、`hana-music-api/schemas/playlist_tags_update` 导入运行时校验器）。

```ts
type PlaylistTagsUpdateBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
