---
title: 'vip 成长值获取记录'
description: '登录后调用此接口可获取会员成长值领取记录'
---

# vip 成长值获取记录

> 登录后调用此接口可获取会员成长值领取记录

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/vip/growthpoint/details` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `vip_growthpoint_details`  |
| 文档分类 | 会员与云贝                 |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                              |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                           |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*10, 其中 10 为 limit 的值 |

## HTTP 示例

```bash
GET /vip/growthpoint/details?limit=10
```

## 编程式调用

```ts
import { vipGrowthpointDetails } from 'hana-music-api';

const result = await vipGrowthpointDetails({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code`、记录页 `body.data` 和记录列表 `body.data.details` 收紧；记录里的 `resourceId`、`descript`、`growthPoint`、`time` 都是宽松字段。`offset=100000` 越过列表返回空数组（录制 `vip/vip_growthpoint_details.offset-100000.json`），匿名调用也没有记录（`vip/vip_growthpoint_details.anonymous.json`）。结构定义和类型是 `VipGrowthpointDetailsBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 :登录后调用此接口可获取会员成长值领取记录

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*10, 其中 10 为 limit 的值

**接口地址 :** `/vip/growthpoint/details`

**调用例子 :** `/vip/growthpoint/details?limit=10`
