---
title: '用户绑定手机'
description: '登录后调用此接口，可以更换绑定手机'
---

# 用户绑定手机

> 登录后调用此接口，可以更换绑定手机

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/user/replacephone` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `user_replacephone`  |
| 文档分类 | 用户与登录           |

## 请求参数

| 参数          | 类型   | 必填 | 默认值 | 说明                 |
| ------------- | ------ | :--: | ------ | -------------------- |
| `phone`       | string |  ✅  | -      | 手机号码             |
| `oldcaptcha`  | string |  ✅  | -      | 原手机号码的验证码   |
| `captcha`     | string |  ✅  | -      | 新手机号码的验证码   |
| `countrycode` | string |  —   | 86     | 国家地区代码,默认 86 |

## HTTP 示例

```bash
GET /user/replacephone?phone=xxx&captcha=1234&oldcaptcha=2345
```

## 编程式调用

```ts
import { userReplacephone } from 'hana-music-api'

const result = await userReplacephone({
  phone: 'xxx',
  captcha: '1234',
  oldcaptcha: '2345',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口，可以更换绑定手机

**必选参数 :**

`phone` : 手机号码

`oldcaptcha`: 原手机号码的验证码

`captcha`:新手机号码的验证码

**可选参数 :**

`countrycode`: 国家地区代码,默认 86

**接口地址 :** `/user/replacephone`

**调用例子 :** `/user/replacephone?phone=xxx&captcha=1234&oldcaptcha=2345`
