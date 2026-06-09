---
title: '二维码检测扫码状态接口'
description: '轮询此接口可获取二维码扫码状态,800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies),如扫码后返回502,则需加上noCookie参数,如`&noCookie=true`'
---

# 二维码检测扫码状态接口

> 轮询此接口可获取二维码扫码状态,800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies),如扫码后返回502,则需加上noCookie参数,如`&noCookie=true`

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/login/qr/check` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `login_qr_check`  |
| 文档分类 | 用户与登录        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /login/qr/check?key=xxx
```

## 编程式调用

```ts
import { loginQrCheck } from 'hana-music-api'

const result = await loginQrCheck({
  key: 'xxx',
})

console.log(result.body)
```

## 补充说明

说明: 轮询此接口可获取二维码扫码状态,800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies),如扫码后返回502,则需加上noCookie参数,如`&noCookie=true`

必选参数: `key`,由第一个接口生成

**接口地址 :** `/login/qr/check`

**调用例子 :** `/login/qr/check?key=xxx`

调用可参考项目文件例子

`/public/qrlogin.html` (访问地址:`/qrlogin.html`)

`/public/qrlogin-nocookie.html` (访问地址:`/qrlogin-nocookie.html`)
