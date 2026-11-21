---
title: '收藏/取消收藏歌手'
description: '调用此接口，可收藏歌手'
---

# 收藏/取消收藏歌手

调用此接口，可收藏歌手

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/artist/sub`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `artist_sub`                                   |
| SDK 函数   | `artistSub`（`hana-music-api/api/artist_sub`） |
| 返回体类型 | `ArtistSubBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistSub } from 'hana-music-api';

const result = await artistSub(
  {
    id: '6452',
    t: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/sub' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=6452' \
  --data-urlencode 't=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                           |
| ---- | ------------------ | ---- | ------ | ------------------------------ |
| `id` | `number \| string` | 是   | -      | 歌手 id                        |
| `t`  | `0 \| 1`           | 是   | -      | 操作，1 为收藏，其他为取消收藏 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistSubBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_sub`、`hana-music-api/schemas/artist_sub` 导入运行时校验器）。

```ts
type ArtistSubBody = {
  code: 200;
  data?: null | null;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `null`   | 否   | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **可选 `checkToken`**：SDK 调用支持在第二个参数配置 `checkToken`（固定字符串或异步 provider 函数），详见 [配置参考](/guide/config) 与 [Watchman](/guide/watchman)；HTTP 服务不接受 `checkToken` 参数。
- **请求身份**：收藏与取消收藏均固定使用网页端协议与浏览器请求头，并保留当前登录 Cookie；写操作不缓存、不自动重试。
