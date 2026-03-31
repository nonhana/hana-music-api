---
title: '电台 - 订阅'
description: '登录后调用此接口 , 传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定'
---

# 电台 - 订阅

> 登录后调用此接口 , 传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定

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
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_sub({
  rid: '336355127',
  t: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定
type='1009' 获取其 id, 如`/search?keywords= 代码时间 &type=1009`

**必选参数 :** `rid`: 电台 的 id

**接口地址 :** `/dj/sub`

**调用例子 :** `/dj/sub?rid=336355127&t=1` ( 对应关注 ' 代码时间 ')
`/dj/sub?rid=336355127&t=0` ( 对应取消关注 ' 代码时间 ')

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
