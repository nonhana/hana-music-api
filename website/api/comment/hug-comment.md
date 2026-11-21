---
title: '抱一抱评论'
description: '调用此接口，可抱一抱评论'
---

# 抱一抱评论

调用此接口，可抱一抱评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/hug/comment`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `hug_comment`                                    |
| SDK 函数   | `hugComment`（`hana-music-api/api/hug_comment`） |
| 返回体类型 | `UnknownJson`（未建模接口）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { hugComment } from 'hana-music-api';

const result = await hugComment(
  {
    uid: '285516405',
    cid: '1167145843',
    sid: '863481066',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/hug/comment' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=285516405' \
  --data-urlencode 'cid=1167145843' \
  --data-urlencode 'sid=863481066'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                     |
| ------ | ------------------ | ---- | ------ | ---------------------------------------- |
| `uid`  | `number \| string` | 是   | -      | 用户 id                                  |
| `cid`  | `number \| string` | 是   | -      | 评论 id                                  |
| `sid`  | `number \| string` | 是   | -      | 资源 id                                  |
| `type` | `number`           | 否   | -      | 资源类型，见下方枚举表，默认 `0`（歌曲） |

| `type` | 资源类型                          |
| ------ | --------------------------------- |
| `0`    | 歌曲                              |
| `1`    | MV                                |
| `2`    | 歌单                              |
| `3`    | 专辑                              |
| `4`    | 电台节目                          |
| `5`    | 视频                              |
| `6`    | 动态（部分接口需改传 `threadId`） |
| `7`    | 电台                              |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
