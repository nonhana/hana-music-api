---
title: "新碟上架"
description: "调用此接口 , 可获取新碟上架列表 , 如需具体音乐信息需要调用获取专辑列表接"
---

# 新碟上架

> 调用此接口 , 可获取新碟上架列表 , 如需具体音乐信息需要调用获取专辑列表接

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/top/album` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `top_album` |
| 文档分类 | 专辑 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `area` | string | — | - | ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本 |
| `type` | string | — | new | new:全部 hot:热门,默认为 new |
| `year` | string | — | 本年 | 年,默认本年 |
| `month` | string | — | 本月 | 月,默认本月 |

## HTTP 示例

```bash
GET /top/album?offset=0&limit=30&year=2019&month=6
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.top_album({
  offset: "0",
  limit: "30",
  year: "2019",
  month: "6",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取新碟上架列表 , 如需具体音乐信息需要调用获取专辑列表接
口 `/album` , 然后传入 id, 如 `/album?id=32311`

**可选参数 :**

`area`: ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本

`type` : new:全部 hot:热门,默认为 new

`year` : 年,默认本年

`month` : 月,默认本月

**接口地址 :** `/top/album`

**调用例子 :** `/top/album?offset=0&limit=30&year=2019&month=6`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
