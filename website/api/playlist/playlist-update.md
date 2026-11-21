---
title: '更新歌单'
description: '登录后调用此接口，可以更新用户歌单'
---

# 更新歌单

登录后调用此接口，可以更新用户歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/playlist/update`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `playlist_update`                                        |
| SDK 函数   | `playlistUpdate`（`hana-music-api/api/playlist_update`） |
| 返回体类型 | `PlaylistUpdateBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistUpdate } from 'hana-music-api';

const result = await playlistUpdate(
  {
    id: 347230,
    name: '新建歌单',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/update' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=347230' \
  --data-urlencode 'name=新建歌单'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                          |
| ------ | ------------------ | ---- | ------ | --------------------------------------------- |
| `id`   | `number \| string` | 是   | -      | 歌单id                                        |
| `name` | `string`           | 是   | -      | 歌单名字                                      |
| `desc` | `string`           | 否   | ``     | 歌单描述                                      |
| `tags` | `Array<string>`    | 否   | -      | 歌单tag ，多个用 `;` 隔开，只能用官方规定标签 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistUpdateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_update`、`hana-music-api/schemas/playlist_update` 导入运行时校验器）。

```ts
type RouteResult = {
  code: number;
  message?: string | null;
};

type PlaylistUpdateBody = {
  code: 200;
  '/api/playlist/desc/update': RouteResult;
  '/api/playlist/tags/update': RouteResult;
  '/api/playlist/update/name': RouteResult;
};
```

| 字段                                | 类型          | 必填 | 说明                         |
| ----------------------------------- | ------------- | ---- | ---------------------------- |
| `code`                              | `200`         | 是   | 业务状态码（`200` 表示成功） |
| `/api/playlist/desc/update`         | `RouteResult` | 是   | -                            |
| `/api/playlist/desc/update.code`    | `number`      | 是   | 业务状态码（`200` 表示成功） |
| `/api/playlist/desc/update.message` | `string`      | 否   | 返回说明信息                 |
| `/api/playlist/tags/update`         | `RouteResult` | 是   | -                            |
| `/api/playlist/tags/update.code`    | `number`      | 是   | 业务状态码（`200` 表示成功） |
| `/api/playlist/tags/update.message` | `string`      | 否   | 返回说明信息                 |
| `/api/playlist/update/name`         | `RouteResult` | 是   | -                            |
| `/api/playlist/update/name.code`    | `number`      | 是   | 业务状态码（`200` 表示成功） |
| `/api/playlist/update/name.message` | `string`      | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
