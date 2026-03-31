---
title: "验证接口 - 二维码生成"
description: "进行某些操作,如关注用户,可能会触发验证,可调用这个接口生成二维码,使用app扫码后可解除验证"
---

# 验证接口 - 二维码生成

> 进行某些操作,如关注用户,可能会触发验证,可调用这个接口生成二维码,使用app扫码后可解除验证

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/verify/getQr` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `verify_getQr` |
| 文档分类 | 其他工具 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /verify/getQr
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.verify_getQr()

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

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
