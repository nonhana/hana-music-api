---
title: '电台 - 新晋电台榜/热门电台榜'
description: '登录后调用此接口 , 可获得新晋电台榜/热门电台榜'
---

# 电台 - 新晋电台榜/热门电台榜

> 登录后调用此接口 , 可获得新晋电台榜/热门电台榜

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/toplist`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_toplist`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                        |
| -------- | ---------------- | :--: | ------ | --------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 100    | 返回数量 , 默认为 100                                                       |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 , 如 :( 页数 -1)\*100, 其中 100 为 limit 的值 , 默认为 0 |
| `type`   | string           |  —   | -      | 榜单类型, `new` 为新晋电台榜,`hot`为热门电台榜                              |

## HTTP 示例

```bash
GET /dj/toplist?type=hot
GET /dj/toplist?type=new&limit=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_toplist({
  type: 'hot',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可获得新晋电台榜/热门电台榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*100, 其中 100 为 limit 的值 , 默认为 0

`type`: 榜单类型, `new` 为新晋电台榜,`hot`为热门电台榜

**接口地址 :** `/dj/toplist`

**调用例子 :** `/dj/toplist?type=hot` `/dj/toplist?type=new&limit=1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
