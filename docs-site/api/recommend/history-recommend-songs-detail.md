---
title: '获取历史日推详情数据'
description: '调用此接口 ,传入当日日期, 可获得当日历史日推数据'
---

# 获取历史日推详情数据

> 调用此接口 ,传入当日日期, 可获得当日历史日推数据

## 接口信息

| 项目     | 值                                |
| -------- | --------------------------------- |
| 接口地址 | `/history/recommend/songs/detail` |
| 请求方式 | `GET` / `POST`                    |
| 需要登录 | 否                                |
| 对应模块 | `history_recommend_songs_detail`  |
| 文档分类 | 推荐与发现                        |

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                               |
| ------ | ------------------ | :--: | ------ | -------------------------------------------------- |
| `date` | string[] \| string |  ✅  | -      | 日期,通过历史日推可用日期列表接口获取,不能任意日期 |

## HTTP 示例

```bash
GET /history/recommend/songs/detail?date=2020-06-21
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.history_recommend_songs_detail({
  date: '2020-06-21',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,传入当日日期, 可获得当日历史日推数据

**必选参数 :** `date`: 日期,通过历史日推可用日期列表接口获取,不能任意日期

**接口地址 :** `/history/recommend/songs/detail`

**调用例子 :** `/history/recommend/songs/detail?date=2020-06-21`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
