---
title: '云贝收入'
description: '分页获取当前账号的云贝收入明细。'
---

# 云贝收入

> 分页获取当前账号的云贝收入明细。

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/yunbei/receipt`    |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `yunbei_receipt`     |
| 文档分类 | 会员与云贝           |
| 上游路径 | `/api/point/receipt` |

## 请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明             |
| -------- | ------ | :--: | ------ | ---------------- |
| `limit`  | number |  —   | `10`   | 返回条目数量     |
| `offset` | number |  —   | `0`    | 偏移量，用于分页 |

## HTTP 示例

```bash
GET /yunbei/receipt
GET /yunbei/receipt?limit=1
```

## 编程式调用

```ts
import { yunbeiReceipt } from 'hana-music-api'

const result = await yunbeiReceipt({
  limit: 10,
  offset: 0,
})

console.log(result.body)
```

## 返回关注点

- `code`: 请求是否成功。
- `data`: 当前账号的云贝收入明细。
