---
title: "签到"
description: "调用此接口 , 传入签到类型 ( 可不传 , 默认安卓端签到 ), 可签到 ( 需要登录"
---

# 签到

> 调用此接口 , 传入签到类型 ( 可不传 , 默认安卓端签到 ), 可签到 ( 需要登录

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/daily_signin` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `daily_signin` |
| 文档分类 | 会员与云贝 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `type` | string | — | 0 | 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到 |

## HTTP 示例

```bash
GET /daily_signin
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.daily_signin()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入签到类型 ( 可不传 , 默认安卓端签到 ), 可签到 ( 需要登录
), 其中安卓端签到可获得 3 点经验 , web/PC 端签到可获得 2 点经验

**可选参数 :** `type`: 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到

**接口地址 :** `/daily_signin`

**调用例子 :** `/daily_signin`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
