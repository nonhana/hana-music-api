---
title: '数字专辑销量'
description: '调用此接口，传入专辑 id, 可获取数字专辑销量'
---

# 数字专辑销量

> 调用此接口，传入专辑 id, 可获取数字专辑销量

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/digitalAlbum/sales` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `digitalAlbum_sales`  |
| 文档分类 | 专辑                  |

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明                        |
| ----- | ------------------ | :--: | ------ | --------------------------- |
| `ids` | string[] \| string |  ✅  | -      | 专辑 id, 支持多个,用`,`隔开 |

## HTTP 示例

```bash
GET /digitalAlbum/sales?ids=120605500
GET /digitalAlbum/sales?ids=120605500,125080528
```

## 编程式调用

```ts
import { digitalAlbumSales } from 'hana-music-api'

const result = await digitalAlbumSales({
  ids: '120605500',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，传入专辑 id, 可获取数字专辑销量

**必选参数 :** `ids` : 专辑 id, 支持多个,用`,`隔开

**接口地址 :** `/digitalAlbum/sales`

**调用例子 :** `/digitalAlbum/sales?ids=120605500` `/digitalAlbum/sales?ids=120605500,125080528`
