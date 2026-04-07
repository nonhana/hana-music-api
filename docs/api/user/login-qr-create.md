---
title: '二维码生成接口'
description: '调用此接口传入上一个接口生成的 key 可生成二维码图片的 base64 和二维码信息,可使用 base64 展示图片,或者使用二维码信息内容自行使用第三方二维码生成库渲染二维码'
---

# 二维码生成接口

> 调用此接口传入上一个接口生成的 key 可生成二维码图片的 base64 和二维码信息,可使用 base64 展示图片,或者使用二维码信息内容自行使用第三方二维码生成库渲染二维码

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/login/qr/create` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `login_qr_create`  |
| 文档分类 | 用户与登录         |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /login/qr/create?key=xxx
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.login_qr_create({
  key: 'xxx',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口传入上一个接口生成的 key 可生成二维码图片的 base64 和二维码信息,可使用 base64 展示图片,或者使用二维码信息内容自行使用第三方二维码生成库渲染二维码

必选参数: `key`,由第一个接口生成

可选参数: `qrimg` 传入后会额外返回二维码图片 base64 编码

**接口地址 :** `/login/qr/create`

**调用例子 :** `/login/qr/create?key=xxx`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
