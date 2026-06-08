---
title: '云贝支出'
description: '分页获取当前账号的云贝支出明细。'
---

# 云贝支出

> 分页获取当前账号的云贝支出明细。

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/yunbei/expense`    |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `yunbei_expense`     |
| 文档分类 | 会员与云贝           |
| 上游路径 | `/api/point/expense` |

## 请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明             |
| -------- | ------ | :--: | ------ | ---------------- |
| `limit`  | number |  —   | `10`   | 返回条目数量     |
| `offset` | number |  —   | `0`    | 偏移量，用于分页 |

## HTTP 示例

```bash
GET /yunbei/expense
GET /yunbei/expense?limit=1
```

## 编程式调用

```ts
import { yunbeiExpense } from 'hana-music-api'

const result = await yunbeiExpense({
  limit: 10,
  offset: 0,
})

console.log(result.body)
```

## 返回关注点

- `code`: 请求是否成功。
- `data`: 当前账号的云贝支出明细。

## 维护说明

- 本页依据历史 `home.md` 和当前迁移实现补写。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
