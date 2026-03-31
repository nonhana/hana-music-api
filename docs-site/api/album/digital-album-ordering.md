---
title: "购买数字专辑"
description: "登录后调用此接口 ,可获取购买数字专辑的地址,把地址生成二维码后,可扫描购买专辑"
---

# 购买数字专辑

> 登录后调用此接口 ,可获取购买数字专辑的地址,把地址生成二维码后,可扫描购买专辑

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/digitalAlbum/ordering` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `digitalAlbum_ordering` |
| 文档分类 | 专辑 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 专辑的 id |
| `payment` | string | ✅ | - | 支付方式， 0 为支付宝 3 为微信 |
| `quantity` | number \| string | ✅ | - | 购买的数量 |

## HTTP 示例

```bash
GET /digitalAlbum/ordering?id=86286082&payment=3&quantity=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.digitalAlbum_ordering({
  id: "86286082",
  payment: "3",
  quantity: "1",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取购买数字专辑的地址,把地址生成二维码后,可扫描购买专辑

**必选参数 :**

`id` : 专辑的 id

`payment` : 支付方式， 0 为支付宝 3 为微信

`quantity` : 购买的数量

**接口地址 :** `/digitalAlbum/ordering`

**调用例子 :** `/digitalAlbum/ordering?id=86286082&payment=3&quantity=1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
