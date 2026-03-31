---
title: "全部 mv"
description: "调用此接口 , 可获取全部 mv"
---

# 全部 mv

> 调用此接口 , 可获取全部 mv

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/mv/all` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `mv_all` |
| 文档分类 | 视频与 MV |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `area` | string | — | - | 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部 |
| `type` | string | — | - | 类型,可选值为全部,官方版,原生,现场版,网易出品,不填则为全部 |
| `order` | string | — | - | 排序,可选值为上升最快,最热,最新,不填则为上升最快 |
| `limit` | number \| string | — | 30 | 取出数量 , 默认为 30 |
| `offset` | number \| string | — | <br>为 | 偏移数量 , 用于分页 , 如 :( 页数 -1)\*50, 其中 50 为 limit 的值 , 默认<br>为 0 |

## HTTP 示例

```bash
GET /mv/all?area=港台
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.mv_all({
  area: "港台",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取全部 mv

**可选参数 :**  
`area`: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部
`type`: 类型,可选值为全部,官方版,原生,现场版,网易出品,不填则为全部

`order`: 排序,可选值为上升最快,最热,最新,不填则为上升最快

`limit`: 取出数量 , 默认为 30

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*50, 其中 50 为 limit 的值 , 默认
为 0

**接口地址 :** `/mv/all`

**调用例子 :** `/mv/all?area=港台`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
