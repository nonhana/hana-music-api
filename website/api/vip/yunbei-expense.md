---
title: '云贝支出'
description: '分页获取当前账号的云贝支出明细。'
---

# 云贝支出

分页获取当前账号的云贝支出明细。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/yunbei/expense`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `yunbei_expense`                                       |
| SDK 函数   | `yunbeiExpense`（`hana-music-api/api/yunbei_expense`） |
| 返回体类型 | `UnknownJson`（未建模接口）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbeiExpense } from 'hana-music-api';

const result = await yunbeiExpense(
  {
    limit: 10,
    offset: 0,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/yunbei/expense' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'offset=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明             |
| -------- | -------- | ---- | ------ | ---------------- |
| `limit`  | `number` | 否   | `10`   | 返回条目数量     |
| `offset` | `number` | 否   | `0`    | 偏移量，用于分页 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
