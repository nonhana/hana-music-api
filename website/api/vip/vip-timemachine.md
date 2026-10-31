---
title: '黑胶时光机'
description: '调用此接口，可获得黑胶时光机数据'
---

# 黑胶时光机

> 调用此接口，可获得黑胶时光机数据

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/vip/timemachine` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `vip_timemachine`  |
| 文档分类 | 会员与云贝         |

## 请求参数

| 参数        | 类型             | 必填 | 默认值 | 说明                |
| ----------- | ---------------- | :--: | ------ | ------------------- |
| `startTime` | string           |  —   | -      | 开始时间            |
| `endTime`   | string           |  —   | -      | 结束时间            |
| `limit`     | number \| string |  —   | 60     | 返回数量，默认为 60 |

## HTTP 示例

```bash
GET /vip/timemachine
GET /vip/timemachine?startTime=1638288000000&endTime=1640966399999&limit=10
GET /vip/timemachine?startTime=1609430400&endTime=1640966399999&limit=60
```

## 编程式调用

```ts
import { vipTimemachine } from 'hana-music-api';

const result = await vipTimemachine();

console.log(result.body);
```

## 返回内容

`body.code`、时光机页 `body.data`、周报列表 `body.data.detail`、每份周报自己的 `body.data.detail[].rowKey` 和报告体 `body.data.detail[].data` 收紧。`data.detail` 可以没有：没有记录的周区间返回 `null`（录制 `vip/vip_timemachine.empty.json`），缺失或 `null` 都照常返回。每份周报的报告体必填：`data` 缺失、`null` 或非对象报 502。四种周报类型（`type` 1–4）的报告内容写进同一个宽松结构；`hasnext`、`recordTime`、`notVipLimitNum`、`showcashier`、`beta` 宽松。结构定义和类型是 `VipTimemachineBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获得黑胶时光机数据

**可选参数 :** `startTime` : 开始时间
`endTime` : 结束时间
`limit` : 返回数量，默认为 60

**接口地址 :** `/vip/timemachine`

**调用例子 :** `/vip/timemachine` `/vip/timemachine?startTime=1638288000000&endTime=1640966399999&limit=10`（2021年12月） `/vip/timemachine?startTime=1609430400&endTime=1640966399999&limit=60`(2021年)
