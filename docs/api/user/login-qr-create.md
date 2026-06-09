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

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /login/qr/create?key=xxx
```

## 编程式调用

```ts
import { loginQrCreate } from 'hana-music-api'

const result = await loginQrCreate({
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
