---
title: '更换绑定手机'
description: '调用此接口 ,可更换绑定手机(流程:先发送验证码到原手机号码,再发送验证码到新手机号码然后再调用此接口)'
---

# 更换绑定手机

> 调用此接口 ,可更换绑定手机(流程:先发送验证码到原手机号码,再发送验证码到新手机号码然后再调用此接口)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/rebind`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `rebind`       |
| 文档分类 | 用户与登录     |

## 请求参数

| 参数         | 类型   | 必填 | 默认值 | 说明                    |
| ------------ | ------ | :--: | ------ | ----------------------- |
| `oldcaptcha` | string |  ✅  | -      | 原手机验证码            |
| `captcha`    | string |  ✅  | -      | 新手机验证码            |
| `phone`      | string |  ✅  | -      | 手机号码                |
| `ctcode`     | string |  ✅  | 86     | 国家区号,默认 86 即中国 |

## HTTP 示例

```bash
GET /rebind?phone=xxx&oldcaptcha=1234&captcha=5678
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.rebind({
  phone: 'xxx',
  oldcaptcha: '1234',
  captcha: '5678',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,可更换绑定手机(流程:先发送验证码到原手机号码,再发送验证码到新手机号码然后再调用此接口)

**必选参数 :**
`oldcaptcha`: 原手机验证码

`captcha`: 新手机验证码

`phone` : 手机号码

`ctcode` : 国家区号,默认 86 即中国

**接口地址 :** `/rebind`

**调用例子 :** `/rebind?phone=xxx&oldcaptcha=1234&captcha=5678`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
