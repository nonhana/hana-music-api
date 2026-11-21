---
title: '验证验证码'
description: '调用此接口 ，传入手机号码和验证码，可校验验证码是否正确'
---

# 验证验证码

调用此接口 ，传入手机号码和验证码，可校验验证码是否正确

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/captcha/verify`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `captcha_verify`                                       |
| SDK 函数   | `captchaVerify`（`hana-music-api/api/captcha_verify`） |
| 返回体类型 | `UnknownJson`（未建模接口）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { captchaVerify } from 'hana-music-api';

const result = await captchaVerify({
  phone: '13xxx',
  captcha: '1597',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/captcha/verify' \
  --data-urlencode 'phone=13xxx' \
  --data-urlencode 'captcha=1597'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型               | 必填 | 默认值 | 说明                     |
| --------- | ------------------ | ---- | ------ | ------------------------ |
| `captcha` | `string`           | 是   | -      | 验证码                   |
| `ctcode`  | `number \| string` | 否   | `86`   | 国家区号，默认 86 即中国 |
| `phone`   | `string`           | 是   | -      | 手机号码                 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
