---
title: "首页-发现"
description: "调用此接口 , 可获取 APP 首页信息"
---

# 首页-发现

> 调用此接口 , 可获取 APP 首页信息

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/homepage/block/page` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `homepage_block_page` |
| 文档分类 | 推荐与发现 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `refresh` | boolean | — | false | 是否刷新数据,默认为 false |
| `cursor` | number \| string | — | - | 上一条数据返回的 cursor |

## HTTP 示例

```bash
GET /homepage/block/page
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.homepage_block_page()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取 APP 首页信息

**接口地址 :** `/homepage/block/page`

**可选参数 :** `refresh`: 是否刷新数据,默认为 false

`cursor`: 上一条数据返回的 cursor

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
