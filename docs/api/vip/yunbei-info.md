---
title: '云贝账户信息'
description: '登录后调用此接口可获取云贝账户信息(账户云贝数)'
---

# 云贝账户信息

> 登录后调用此接口可获取云贝账户信息(账户云贝数)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/yunbei/info` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `yunbei_info`  |
| 文档分类 | 会员与云贝     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/info
```

## 编程式调用

```ts
import { yunbeiInfo } from 'hana-music-api'

const result = await yunbeiInfo()

console.log(result.body)
```

## 补充说明

说明 :登录后调用此接口可获取云贝账户信息(账户云贝数)

**接口地址 :** `/yunbei/info`

**调用例子 :** `/yunbei/info`
