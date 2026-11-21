---
title: '更换绑定手机'
description: '调用此接口 ，可更换绑定手机(流程:先发送验证码到原手机号码，再发送验证码到新手机号码然后再调用此接口)'
---

# 更换绑定手机

调用此接口 ，可更换绑定手机(流程:先发送验证码到原手机号码，再发送验证码到新手机号码然后再调用此接口)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                      |
| ---------- | --------------------------------------- |
| 接口地址   | `/rebind`                               |
| 请求方式   | `GET` / `POST`                          |
| 需要登录   | 否                                      |
| 对应模块   | `rebind`                                |
| SDK 函数   | `rebind`（`hana-music-api/api/rebind`） |
| 返回体类型 | `UnknownJson`（未建模接口）             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { rebind } from 'hana-music-api';

const result = await rebind({
  phone: 'xxx',
  oldcaptcha: '1234',
  captcha: '5678',
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/rebind' \
  -H 'Content-Type: application/json' \
  --data '{"phone":"xxx","oldcaptcha":"1234","captcha":"5678"}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数         | 类型               | 必填 | 默认值 | 说明                     |
| ------------ | ------------------ | ---- | ------ | ------------------------ |
| `captcha`    | `string`           | 是   | -      | 新手机验证码             |
| `ctcode`     | `number \| string` | 否   | `86`   | 国家区号，默认 86 即中国 |
| `oldcaptcha` | `string`           | 是   | -      | 原手机验证码             |
| `phone`      | `string`           | 是   | -      | 手机号码                 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
