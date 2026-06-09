---
title: '最近联系人'
description: '登录后调用此接口 ,可获取最接近联系人'
---

# 最近联系人

> 登录后调用此接口 ,可获取最接近联系人

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/msg/recentcontact` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `msg_recentcontact`  |
| 文档分类 | 社交与消息           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /msg/recentcontact
```

## 编程式调用

```ts
import { msgRecentcontact } from 'hana-music-api'

const result = await msgRecentcontact()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取最接近联系人

**接口地址 :** `/msg/recentcontact`

**调用例子 :** `/msg/recentcontact`
