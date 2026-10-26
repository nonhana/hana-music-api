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
import { yunbeiExpense } from 'hana-music-api';

const result = await yunbeiExpense({
  limit: 10,
  offset: 0,
});

console.log(result.body);
```

## 返回内容

本接口尚未补 `ModuleBody`：2026-10-26 用登录账号探测（先经 `login_status` 确认 `account.anonimousUser: false`）仍返回 `code: 404`、消息“接口未找到”，没有成功返回体证据。SDK 不校验返回体，`body` 原样转交；出现成功返回后再按“收紧与宽松”补录并声明。

## 返回关注点

- `code`: 请求是否成功。
- `data`: 当前账号的云贝支出明细。
