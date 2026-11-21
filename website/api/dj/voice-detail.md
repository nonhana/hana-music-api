---
title: '播客声音详情'
description: '获取播客里的声音详情'
---

# 播客声音详情

获取播客里的声音详情

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/voice/detail`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `voice_detail`                                     |
| SDK 函数   | `voiceDetail`（`hana-music-api/api/voice_detail`） |
| 返回体类型 | `UnknownJson`（未建模接口）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voiceDetail } from 'hana-music-api';

const result = await voiceDetail(
  {
    id: 347230,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/voice/detail' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                |
| ---- | ------------------ | ---- | ------ | ------------------- |
| `id` | `number \| string` | 是   | -      | 播客声音id(voiceId) |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
