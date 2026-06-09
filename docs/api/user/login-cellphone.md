---
title: '手机登录'
description: '手机登录 接口文档。'
---

# 手机登录

> 手机登录 接口文档。

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/login/cellphone` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `login_cellphone`  |
| 文档分类 | 用户与登录         |

## 请求参数

| 参数           | 类型   | 必填 | 默认值 | 说明                                                                                                                                  |
| -------------- | ------ | :--: | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `phone`        | string |  ✅  | -      | 手机号码                                                                                                                              |
| `password`     | string |  ✅  | -      | 密码                                                                                                                                  |
| `countrycode`  | string |  —   | -      | 国家码，用于国外手机号登录，例如美国传入：`1`                                                                                         |
| `md5_password` | string |  —   | -      | md5 加密后的密码,传入后 `password` 参数将失效                                                                                         |
| `captcha`      | string |  —   | -      | 验证码,使用 [`/captcha/sent`](#发送验证码)接口传入手机号获取验证码,调用此接口传入验证码,可使用验证码登录,传入后 `password` 参数将失效 |

## HTTP 示例

```bash
GET /login/cellphone?phone=xxx&password=yyy
GET /login/cellphone?phone=xxx&md5_password=yyy
GET /login/cellphone?phone=xxx&captcha=1234
```

## 编程式调用

```ts
import { loginCellphone } from 'hana-music-api'

const result = await loginCellphone({
  phone: 'xxx',
  password: 'yyy',
})

console.log(result.body)
```

## 补充说明

**必选参数 :**  
`phone`: 手机号码

`password`: 密码

**可选参数 :**  
`countrycode`: 国家码，用于国外手机号登录，例如美国传入：`1`

`md5_password`: md5 加密后的密码,传入后 `password` 参数将失效

`captcha`: 验证码,使用 [`/captcha/sent`](/api/user/captcha-sent)接口传入手机号获取验证码,调用此接口传入验证码,可使用验证码登录,传入后 `password` 参数将失效

**接口地址 :** `/login/cellphone`

**调用例子 :** `/login/cellphone?phone=xxx&password=yyy` `/login/cellphone?phone=xxx&md5_password=yyy` `/login/cellphone?phone=xxx&captcha=1234`
