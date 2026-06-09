---
title: '验证接口 - 二维码检测'
description: '使用此接口,传入`/verify/getQr`接口返回的`qr`字符串,可检测二维码扫描状态'
---

# 验证接口 - 二维码检测

> 使用此接口,传入`/verify/getQr`接口返回的`qr`字符串,可检测二维码扫描状态

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/verify/qrcodestatus` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `verify_qrcodestatus`  |
| 文档分类 | 其他工具               |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /verify/qrcodestatus
```

## 编程式调用

```ts
import { verifyQrcodestatus } from 'hana-music-api'

const result = await verifyQrcodestatus()

console.log(result.body)
```

## 补充说明

说明: 使用此接口,传入`/verify/getQr`接口返回的`qr`字符串,可检测二维码扫描状态

**接口地址:** `/verify/qrcodestatus`

**必选参数：**

`qr`: `/verify/getQr`接口返回的`qr`字符串

返回结果说明:

qrCodeStatus:0,detailReason:0 二维码生成成功

qrCodeStatus:0,detailReason:303 账号不一致

qrCodeStatus:10,detailReason:0 二维码已扫描,并且手机号相同

qrCodeStatus:20,detailReason:0 验证成功qrCodeStatus:21,detailReason:0 二维码已失效
