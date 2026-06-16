---
title: '电台 - 订阅'
description: '登录后调用此接口，传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定'
---

# 电台 - 订阅

> 登录后调用此接口，传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/sub`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_sub`       |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明       |
| ----- | ------ | :--: | ------ | ---------- |
| `rid` | string |  ✅  | -      | 电台 的 id |

## HTTP 示例

```bash
GET /dj/sub?rid=336355127&t=1
GET /dj/sub?rid=336355127&t=0
```

## 编程式调用

```ts
import { djSub } from 'hana-music-api'

const result = await djSub({
  rid: '336355127',
  t: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口，传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定
type='1009' 获取其 id, 如`/search?keywords= 代码时间 &type=1009`

**必选参数 :** `rid`: 电台 的 id

**接口地址 :** `/dj/sub`

**调用例子 :** `/dj/sub?rid=336355127&t=1` ( 对应关注 ' 代码时间 ')
`/dj/sub?rid=336355127&t=0` ( 对应取消关注 ' 代码时间 ')
