---
title: '播客删除'
description: '可以删除播客'
---

# 播客删除

可以删除播客

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/voice/delete`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `voice_delete`                                     |
| SDK 函数   | `voiceDelete`（`hana-music-api/api/voice_delete`） |
| 返回体类型 | `UnknownJson`（未建模接口）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voiceDelete } from 'hana-music-api';

const result = await voiceDelete(
  {
    ids: [347230],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/voice/delete' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明                                  |
| ----- | ------------------------- | ---- | ------ | ------------------------------------- |
| `ids` | `Array<number \| string>` | 是   | -      | 播客id，即voiceListId，多个以逗号隔开 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
