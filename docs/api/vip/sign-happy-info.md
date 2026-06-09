---
title: '乐签信息'
description: '调用此接口, 可获取乐签信息'
---

# 乐签信息

> 调用此接口, 可获取乐签信息

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/sign/happy/info` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `sign_happy_info`  |
| 文档分类 | 会员与云贝         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /sign/happy/info
```

## 编程式调用

```ts
import { signHappyInfo } from 'hana-music-api'

const result = await signHappyInfo()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口, 可获取乐签信息

**接口地址 :** `/sign/happy/info`
