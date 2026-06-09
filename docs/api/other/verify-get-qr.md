---
title: '验证接口 - 二维码生成'
description: '进行某些操作,如关注用户,可能会触发验证,可调用这个接口生成二维码,使用app扫码后可解除验证'
---

# 验证接口 - 二维码生成

> 进行某些操作,如关注用户,可能会触发验证,可调用这个接口生成二维码,使用app扫码后可解除验证

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/verify/getQr` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `verify_getQr`  |
| 文档分类 | 其他工具        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /verify/getQr
```

## 编程式调用

```ts
import { verifyGetQr } from 'hana-music-api'

const result = await verifyGetQr()

console.log(result.body)
```

## 补充说明

说明: 进行某些操作,如关注用户,可能会触发验证,可调用这个接口生成二维码,使用app扫码后可解除验证

**接口地址:** `/verify/getQr`

**必选参数：**

`vid`: 触发验证后,接口返回的verifyId

`type`:触发验证后,接口返回的verifyType

`token`:触发验证后,接口返回的verifyToken

`evid`:触发验证后,接口返回的params的event_id

`sign`:触发验证后,接口返回的params的sign
