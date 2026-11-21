---
title: '公开隐私歌单'
description: '可以调用此接口将当前用户的隐私歌单公开。'
---

# 公开隐私歌单

可以调用此接口将当前用户的隐私歌单公开。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                         |
| ---------- | ---------------------------------------------------------- |
| 接口地址   | `/playlist/privacy`                                        |
| 请求方式   | `GET` / `POST`                                             |
| 需要登录   | 是                                                         |
| 对应模块   | `playlist_privacy`                                         |
| SDK 函数   | `playlistPrivacy`（`hana-music-api/api/playlist_privacy`） |
| 返回体类型 | `PlaylistPrivacyBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistPrivacy } from 'hana-music-api';

const result = await playlistPrivacy(
  {
    id: '123456',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/privacy' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=123456'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌单 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistPrivacyBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_privacy`、`hana-music-api/schemas/playlist_privacy` 导入运行时校验器）。

```ts
type PlaylistPrivacyBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
