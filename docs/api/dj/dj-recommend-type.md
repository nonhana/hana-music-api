---
title: '电台 - 分类推荐'
description: '登录后调用此接口，传入分类,可获得对应类型电台列表'
---

# 电台 - 分类推荐

> 登录后调用此接口，传入分类,可获得对应类型电台列表

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/dj/recommend/type` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `dj_recommend_type`  |
| 文档分类 | 电台与播客           |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                                    |
| ------ | ------ | :--: | ------ | ------------------------------------------------------- |
| `type` | string |  ✅  | -      | 电台类型，数字，可通过`/dj/catelist`获取，对应关系为 |
| `id`   | string |  ✅  | -      | 对应 此接口的 type, name 对应类型                       |

## HTTP 示例

```bash
GET /dj/recommend/type?type=1
GET /dj/recommend/type?type=2001
```

## 编程式调用

```ts
import { djRecommendType } from 'hana-music-api'

const result = await djRecommendType({
  type: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口，传入分类,可获得对应类型电台列表

**必选参数 :** `type`: 电台类型，数字，可通过`/dj/catelist`获取，对应关系为
id 对应 此接口的 type, name 对应类型

**接口地址 :** `/dj/recommend/type`

**调用例子 :** `/dj/recommend/type?type=1`(明星做主播) `/dj/recommend/type?type=2001` (创作|翻唱)
