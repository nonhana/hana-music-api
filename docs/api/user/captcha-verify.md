---
title: "验证验证码"
description: "调用此接口 ,传入手机号码和验证码, 可校验验证码是否正确"
---

# 验证验证码

> 调用此接口 ,传入手机号码和验证码, 可校验验证码是否正确

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/captcha/verify` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `captcha_verify` |
| 文档分类 | 用户与登录 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `phone` | string | ✅ | - | 手机号码 |
| `captcha` | string | ✅ | - | 验证码 |
| `ctcode` | string | — | 86 | 国家区号,默认 86 即中国 |

## HTTP 示例

```bash
GET /captcha/verify?phone=13xxx&captcha=1597
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.captcha_verify({
  phone: "13xxx",
  captcha: "1597",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,传入手机号码和验证码, 可校验验证码是否正确

**必选参数 :** `phone`: 手机号码

`captcha`: 验证码

**可选参数 :**

`ctcode`: 国家区号,默认 86 即中国

**接口地址 :** `/captcha/verify`

**调用例子 :** `/captcha/verify?phone=13xxx&captcha=1597`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
