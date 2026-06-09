---
title: '国家编码列表'
description: '调用此接口,可获取国家编码列表'
---

# 国家编码列表

> 调用此接口,可获取国家编码列表

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/countries/code/list` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `countries_code_list`  |
| 文档分类 | 其他工具               |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /countries/code/list
```

## 编程式调用

```ts
import { countriesCodeList } from 'hana-music-api'

const result = await countriesCodeList()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取国家编码列表

**接口地址 :** `/countries/code/list`
