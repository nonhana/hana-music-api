---
title: "用户绑定手机"
description: "登录后调用此接口 , 可以更换绑定手机"
---

# 用户绑定手机

> 登录后调用此接口 , 可以更换绑定手机

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/user/replacephone` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `user_replacephone` |
| 文档分类 | 用户与登录 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `phone` | string | ✅ | - | 手机号码 |
| `oldcaptcha` | string | ✅ | - | 原手机号码的验证码 |
| `captcha` | string | ✅ | - | 新手机号码的验证码 |
| `countrycode` | string | — | 86 | 国家地区代码,默认 86 |

## HTTP 示例

```bash
GET /user/replacephone?phone=xxx&captcha=1234&oldcaptcha=2345
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_replacephone({
  phone: "xxx",
  captcha: "1234",
  oldcaptcha: "2345",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可以更换绑定手机

**必选参数 :**

`phone` : 手机号码

`oldcaptcha`: 原手机号码的验证码

`captcha`:新手机号码的验证码

**可选参数 :**

`countrycode`: 国家地区代码,默认 86

**接口地址 :** `/user/replacephone`

**调用例子 :** `/user/replacephone?phone=xxx&captcha=1234&oldcaptcha=2345`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
