---
title: '转发用户动态'
description: '登录后调用此接口 ，可以转发用户动态'
---

# 转发用户动态

登录后调用此接口 ，可以转发用户动态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/event/forward`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `event_forward`                                      |
| SDK 函数   | `eventForward`（`hana-music-api/api/event_forward`） |
| 返回体类型 | `UnknownJson`（未建模接口）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { eventForward } from 'hana-music-api';

const result = await eventForward(
  {
    evId: '6712917601',
    uid: '32953014',
    forwards: '测试内容',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/event/forward' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'evId=6712917601' \
  --data-urlencode 'uid=32953014' \
  --data-urlencode 'forwards=测试内容'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明       |
| ---------- | ------------------ | ---- | ------ | ---------- |
| `uid`      | `number \| string` | 是   | -      | 用户 id    |
| `evId`     | `number \| string` | 是   | -      | 动态 id    |
| `forwards` | `string`           | 否   | -      | 转发的评论 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
