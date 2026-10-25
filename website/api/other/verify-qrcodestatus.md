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
| 需要登录 | 是                     |
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
import { verifyQrcodestatus } from 'hana-music-api';

const result = await verifyQrcodestatus();

console.log(result.body);
```

## 返回内容

二维码状态在 `data.qrCodeStatus`（`0` 生成成功、`10` 已扫描、`20` 验证成功、`21` 已失效），`data.detailReason` 给出原因码（`0` 正常、`303` 账号不一致）。`code`、`data` 和 `qrCodeStatus` 收紧；`detailReason` 与 `message` 宽松，缺失或 `null` 照常返回；有值但类型不对时丢这一项。上游把成功码写成字符串 `"200"`，请求层会归一成数字 200。本批没有可构造的扫码会话，只录到已失效二维码（`qrCodeStatus: 21`）；未扫、已扫、已确认三态没有录制，未声明额外字段。接口需要登录：未登录时上游返回 `code: 301`（`un login`，`verify_qrcodestatus.anonymous.json`），空 `qr` 返回 `code: 400`（`qrcode is null`，`verify_qrcodestatus.empty.json`），SDK 按业务拒绝原样转交。结构定义和类型是 `VerifyQrcodestatusBody`，见 [返回体结构](/guide/response-bodies)。

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
