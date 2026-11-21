---
title: '签到'
description: '调用此接口，传入签到类型 ( 可不传，默认安卓端签到 )，可签到 ( 需要登录'
---

# 签到

调用此接口，传入签到类型 ( 可不传，默认安卓端签到 )，可签到 ( 需要登录

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/daily_signin`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `daily_signin`                                     |
| SDK 函数   | `dailySignin`（`hana-music-api/api/daily_signin`） |
| 返回体类型 | `UnknownJson`（未建模接口）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { dailySignin } from 'hana-music-api';

const result = await dailySignin(
  {
    type: 0,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/daily_signin' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'type=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型     | 必填 | 默认值 | 说明                                                     |
| ------ | -------- | ---- | ------ | -------------------------------------------------------- |
| `type` | `0 \| 1` | 否   | `0`    | 签到类型，默认 0，其中 0 为安卓端签到 ，1 为 web/PC 签到 |

| `type` | 签到端                              |
| ------ | ----------------------------------- |
| `0`    | Android 端（可获得 3 点经验，默认） |
| `1`    | Web/PC 端（可获得 2 点经验）        |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **签到经验差异**：`type=0`（Android 端）签到可获得 3 点经验，`type=1`（Web/PC 端）签到可获得 2 点经验。
