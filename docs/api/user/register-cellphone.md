---
title: "注册(修改密码)"
description: "调用此接口 ,传入手机号码和验证码,密码,昵称, 可注册网易云音乐账号(同时可修改密码)"
---

# 注册(修改密码)

> 调用此接口 ,传入手机号码和验证码,密码,昵称, 可注册网易云音乐账号(同时可修改密码)

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/register/cellphone` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `register_cellphone` |
| 文档分类 | 用户与登录 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `captcha` | string | ✅ | - | 验证码 |
| `phone` | string | ✅ | - | 手机号码 |
| `password` | string | ✅ | - | 密码 |
| `nickname` | string | ✅ | - | 昵称 |
| `countrycode` | string | — | 86 | 国家码，用于国外手机号，例如美国传入：`1` ,默认 86 即中国 |

## HTTP 示例

```bash
GET /register/cellphone?phone=13xxx&password=xxxxx&captcha=1234&nickname=binary1345
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.register_cellphone({
  phone: "13xxx",
  password: "xxxxx",
  captcha: "1234",
  nickname: "binary1345",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,传入手机号码和验证码,密码,昵称, 可注册网易云音乐账号(同时可修改密码)

**必选参数 :**

`captcha`: 验证码

`phone` : 手机号码

`password`: 密码

`nickname`: 昵称

**可选参数 :**

`countrycode`: 国家码，用于国外手机号，例如美国传入：`1` ,默认 86 即中国

**接口地址 :** `/register/cellphone`

**调用例子 :** `/register/cellphone?phone=13xxx&password=xxxxx&captcha=1234&nickname=binary1345`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
