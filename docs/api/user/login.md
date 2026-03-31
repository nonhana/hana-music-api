---
title: "邮箱登录"
description: "可以直接从浏览器中获取cookie值, 只需要其中key为`MUSIC_U`的数据即可"
---

# 邮箱登录

> 可以直接从浏览器中获取cookie值, 只需要其中key为`MUSIC_U`的数据即可

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/login` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `login` |
| 文档分类 | 用户与登录 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `email` | string | ✅ | - | 163 网易邮箱 |
| `password` | string | ✅ | - | 密码 |
| `md5_password` | string | — | - | md5 加密后的密码,传入后 `password` 将失效 |

## HTTP 示例

```bash
GET /login?email=xxx@163.com&password=yyy
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.login({
  email: "xxx@163.com",
  password: "yyy",
})

console.log(result.body)
```

## 补充说明

**必选参数 :**

`email`: 163 网易邮箱

`password`: 密码

**可选参数 :**

`md5_password`: md5 加密后的密码,传入后 `password` 将失效

**接口地址 :** `/login`

**调用例子 :** `/login?email=xxx@163.com&password=yyy`

完成登录后 , 会在浏览器保存一个 Cookies 用作登录凭证 , 大部分 API 都需要用到这个
Cookies,非跨域情况请求会自动带上 Cookies,跨域情况参考`调用前须知`

v3.30.0 后支持手动传入 cookie,登录接口返回内容新增 `cookie` 字段,保存到本地后,get 请求带上`?cookie=xxx` (先使用 `encodeURIComponent()` 编码 cookie 值) 或者 post 请求 body 带上 `cookie` 即可,如:`/user/cloud?cookie=xxx` 或者

```
{
    ...,
    cookie:"xxx"
}
```
另外的cookie说明:
可以直接从浏览器中获取cookie值, 只需要其中key为`MUSIC_U`的数据即可
请求
```
GET https://example.com/search?keywords=HELLO&cookie=MUSIC_U%3Dxxxx
POST https://example.com/search?keywords=HELLO
body {
  ...,
  "cookie": "MUSIC_U=xxxx"
}
```

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
