---
title: '收藏/取消收藏歌单'
description: '调用此接口，传入类型和歌单 id 可收藏歌单或者取消收藏歌单'
---

# 收藏/取消收藏歌单

调用此接口，传入类型和歌单 id 可收藏歌单或者取消收藏歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/playlist/subscribe`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 是                                                             |
| 对应模块   | `playlist_subscribe`                                           |
| SDK 函数   | `playlistSubscribe`（`hana-music-api/api/playlist_subscribe`） |
| 返回体类型 | `PlaylistSubscribeBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistSubscribe } from 'hana-music-api';

const result = await playlistSubscribe(
  {
    t: 1,
    id: '106697785',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/subscribe' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 't=1' \
  --data-urlencode 'id=106697785'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                            |
| ---- | ------------------ | ---- | ------ | ------------------------------- |
| `id` | `number \| string` | 是   | -      | 歌单 id                         |
| `t`  | `0 \| 1 \| 2`      | 是   | -      | 类型，1：收藏，其他值：取消收藏 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistSubscribeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_subscribe`、`hana-music-api/schemas/playlist_subscribe` 导入运行时校验器）。

```ts
type PlaylistSubscribeBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->

## 注意事项

- **可选 `checkToken`**：高频连续收藏可能触发上游 405 限流，推荐在 SDK 配置中通过异步 `checkToken` provider 从稳定设备/会话现场获取令牌（不要硬编码或跨请求复用同一令牌），详见 [Watchman](/guide/watchman) 与 [配置参考](/guide/config)；HTTP 服务不接受 `checkToken` 参数。
- **请求身份**：收藏（`t=1`）与取消收藏（`t=0` 或 `t=2`）均固定使用网页端协议与浏览器请求头，并保留当前登录 Cookie；写操作不缓存、不自动重试。
- **业务限制**：尝试收藏自己创建的歌单会返回 `code: 401`（歌单创建者已设置隐私）。
