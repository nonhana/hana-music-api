---
title: '云贝签到'
description: '登录后调用此接口可进行云贝签到'
---

# 云贝签到

> 登录后调用此接口可进行云贝签到

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/yunbei/sign` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `yunbei_sign`  |
| 文档分类 | 会员与云贝     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/sign
```

## 编程式调用

```ts
import { yunbeiSign } from 'hana-music-api'

const result = await yunbeiSign()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口可进行云贝签到

**接口地址 :** `/yunbei/sign`

**调用例子 :** `/yunbei/sign`
