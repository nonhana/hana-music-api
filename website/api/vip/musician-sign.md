---
title: '音乐人签到'
description: '音乐人登录后调用此接口，可以完成“登录音乐人中心”任务，然后通过`/musician/cloudbean/obtain`接口可以领取相应的云豆。'
---

# 音乐人签到

音乐人登录后调用此接口，可以完成“登录音乐人中心”任务，然后通过`/musician/cloudbean/obtain`接口可以领取相应的云豆。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/musician/sign`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `musician_sign`                                      |
| SDK 函数   | `musicianSign`（`hana-music-api/api/musician_sign`） |
| 返回体类型 | `UnknownJson`（未建模接口）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicianSign } from 'hana-music-api';

const result = await musicianSign({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/musician/sign' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
