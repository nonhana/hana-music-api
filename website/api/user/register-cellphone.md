---
title: '注册(修改密码)'
description: '调用此接口 ，传入手机号码和验证码，密码，昵称，可注册网易云音乐账号(同时可修改密码)'
---

# 注册(修改密码)

调用此接口 ，传入手机号码和验证码，密码，昵称，可注册网易云音乐账号(同时可修改密码)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/register/cellphone`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 否                                                             |
| 对应模块   | `register_cellphone`                                           |
| SDK 函数   | `registerCellphone`（`hana-music-api/api/register_cellphone`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { registerCellphone } from 'hana-music-api';

const result = await registerCellphone({
  phone: '13xxx',
  password: 'xxxxx',
  captcha: '1234',
  nickname: 'binary1345',
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/register/cellphone' \
  -H 'Content-Type: application/json' \
  --data '{"phone":"13xxx","password":"xxxxx","captcha":"1234","nickname":"binary1345"}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型               | 必填 | 默认值 | 说明                                                       |
| ------------- | ------------------ | ---- | ------ | ---------------------------------------------------------- |
| `captcha`     | `string`           | 是   | -      | 验证码                                                     |
| `countrycode` | `number \| string` | 否   | `86`   | 国家码，用于国外手机号，例如美国传入：`1` ，默认 86 即中国 |
| `nickname`    | `string`           | 是   | -      | 昵称                                                       |
| `password`    | `string`           | 是   | -      | 密码                                                       |
| `phone`       | `string`           | 是   | -      | 手机号码                                                   |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
