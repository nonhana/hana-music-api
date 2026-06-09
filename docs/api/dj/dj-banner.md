---
title: '电台 banner'
description: '调用此接口,可获取电台 banner'
---

# 电台 banner

> 调用此接口,可获取电台 banner

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/banner`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `dj_banner`    |
| 文档分类 | 电台与播客     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/banner
```

## 编程式调用

```ts
import { djBanner } from 'hana-music-api'

const result = await djBanner()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取电台 banner

**接口地址 :** `/dj/banner`

**调用例子 :** `/dj/banner`
