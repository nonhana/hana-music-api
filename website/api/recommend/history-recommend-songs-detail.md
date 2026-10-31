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
import { historyRecommendSongsDetail } from 'hana-music-api';

const result = await historyRecommendSongsDetail({
  date: '2020-06-21',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data`、`data.songs` 和每首歌的 `id` 收紧；`purchaseUrl`、`noHistoryMessage` 宽松；`message` 未声明，原样保留。`data.dates` 只见过空数组、`data.description` 只见过 `null`，未声明并原样保留。日期格式不合法时上游返回 `code: 400` 的业务拒绝，SDK 原样转交，不报 502。结构定义和类型是 `HistoryRecommendSongsDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口 ,传入当日日期, 可获得当日历史日推数据

**必选参数 :** `date`: 日期,通过历史日推可用日期列表接口获取,不能任意日期

**接口地址 :** `/history/recommend/songs/detail`

**调用例子 :** `/history/recommend/songs/detail?date=2020-06-21`
