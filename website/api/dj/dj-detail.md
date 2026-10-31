---
title: '电台 - 详情'
description: '登录后调用此接口，传入`rid`, 可获得对应电台的详情介绍'
---

# 电台 - 详情

> 登录后调用此接口，传入`rid`, 可获得对应电台的详情介绍

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/detail`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_detail`    |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明       |
| ----- | ------ | :--: | ------ | ---------- |
| `rid` | string |  ✅  | -      | 电台 的 id |

## HTTP 示例

```bash
GET /dj/detail?rid=336355127
```

## 编程式调用

```ts
import { djDetail } from 'hana-music-api';

const result = await djDetail({
  rid: '336355127',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到电台详情的 `body.data` 和电台自己的编号 `data.id` 收紧；`dj` 主播复用宽松的 `PlaylistUser` 并补了打赏字段 `canReward`、`rewardCount`，`commentDatas[]` 和其余展示字段宽松。`unlockInfo`、`activityInfo`、`toplistInfo`、`labelDto`、`labels`、`toast`、`limitFreeToast`、`msg` 在本批录制里只见过 `null`，没有声明。付费电台录制 `dj_detail.paid` 覆盖 `feeInfo`：`slogan`、`buyed`、`finished`、`undershelf`、`purchaseCount`、`price`、`originalPrice` 和 `modules[]`（含 `modules[].data[]` 节目记录和旧版 `mainSong`）宽松声明；`feeInfo.discountPrice` 只见过 `null`，没有声明；`feeInfo.videos` 只见过空对象，声明为空对象。普通电台、官方账号电台和付费电台各有一份录制。缺少 `rid` 时上游返回 HTTP 200、正文 `code: 400`，未知 `rid` 返回 `code: 404`（`radio not exist`），SDK 都按业务拒绝转交对应 `status`。结构定义和类型是 `DjDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，传入`rid`, 可获得对应电台的详情介绍

**必选参数 :** `rid`: 电台 的 id

**接口地址 :** `/dj/detail`

**调用例子 :** `/dj/detail?rid=336355127` ( 对应 ' 代码时间 ' 的详情介绍 )
