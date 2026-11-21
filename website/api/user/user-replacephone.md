---
title: '用户绑定手机'
description: '登录后调用此接口，可以更换绑定手机'
---

# 用户绑定手机

登录后调用此接口，可以更换绑定手机

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| 接口地址   | `/user/replacephone`                                         |
| 请求方式   | `GET` / `POST`                                               |
| 需要登录   | 是                                                           |
| 对应模块   | `user_replacephone`                                          |
| SDK 函数   | `userReplacephone`（`hana-music-api/api/user_replacephone`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userReplacephone } from 'hana-music-api';

const result = await userReplacephone(
  {
    phone: 'xxx',
    captcha: '1234',
    oldcaptcha: '2345',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/replacephone' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"phone":"xxx","captcha":"1234","oldcaptcha":"2345"}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型     | 必填 | 默认值 | 说明                  |
| ------------- | -------- | ---- | ------ | --------------------- |
| `phone`       | `string` | 是   | -      | 手机号码              |
| `captcha`     | `string` | 是   | -      | 新手机号码的验证码    |
| `oldcaptcha`  | `string` | 是   | -      | 原手机号码的验证码    |
| `countrycode` | `number` | 否   | 86     | 国家地区代码，默认 86 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
