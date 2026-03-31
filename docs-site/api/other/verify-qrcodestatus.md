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

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /verify/qrcodestatus
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.verify_qrcodestatus()

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

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
