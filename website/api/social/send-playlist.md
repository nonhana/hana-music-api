---
title: '发送私信(带歌单)'
description: '登录后调用此接口，传入用户 id 和要发送的信息和歌单 id，可以发送带歌单的私信(注:不能发送重复的歌单)'
---

# 发送私信(带歌单)

登录后调用此接口，传入用户 id 和要发送的信息和歌单 id，可以发送带歌单的私信(注:不能发送重复的歌单)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/send/playlist`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `send_playlist`                                      |
| SDK 函数   | `sendPlaylist`（`hana-music-api/api/send_playlist`） |
| 返回体类型 | `UnknownJson`（未建模接口）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { sendPlaylist } from 'hana-music-api';

const result = await sendPlaylist(
  {
    playlist: 24381616,
    userIds: [32953014],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/send/playlist' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"playlist":24381616,"userIds":[32953014]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型                      | 必填 | 默认值 | 说明                   |
| ---------- | ------------------------- | ---- | ------ | ---------------------- |
| `playlist` | `number \| string`        | 是   | -      | 要分享的歌单 ID        |
| `userIds`  | `Array<number \| string>` | 是   | -      | 接收私信的用户 ID 数组 |
| `msg`      | `string`                  | 否   | -      | 要发送的信息           |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
