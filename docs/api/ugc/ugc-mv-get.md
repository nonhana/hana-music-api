---
title: 'mv简要百科信息'
description: '登录后调用此接口,使用此接口,传入mv id,可获取对应的mv简要百科信息'
---

# mv简要百科信息

> 登录后调用此接口,使用此接口,传入mv id,可获取对应的mv简要百科信息

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/ugc/mv/get`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `ugc_mv_get`   |
| 文档分类 | 百科与用户贡献 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/mv/get?id=14572641
```

## 编程式调用

```ts
import { ugcMvGet } from 'hana-music-api'

const result = await ugcMvGet({
  id: '14572641',
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,传入mv id,可获取对应的mv简要百科信息

**必选参数：**

`id`: mv id

**接口地址:** `/ugc/mv/get`

**调用例子:** `/ugc/mv/get?id=14572641`
