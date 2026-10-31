---
title: '听歌足迹 - 周/月/年收听报告'
description: '登录后调用此接口, 获取周/月/年收听报告'
---

# 听歌足迹 - 周/月/年收听报告

> 登录后调用此接口, 获取周/月/年收听报告

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/listen/data/report` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `listen_data_report`  |
| 文档分类 | 听歌记录              |

## 请求参数

| 参数      | 类型             | 必填 | 默认值 | 说明                                                                                                                               |
| --------- | ---------------- | :--: | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | string           |  ✅  | -      | 维度类型 周 week 月 month 年 year                                                                                                  |
| `endTime` | number \| string |  —   | -      | 周: 每周周六0点的时间戳 月: 每月最后一天0点的时间戳 年: 每年最后一天0点的时间戳<br>不填就是本周/月的, 今年没结束，则没有今年的数据 |

## HTTP 示例

```bash
GET /listen/data/report?type=month
```

## 编程式调用

```ts
import { listenDataReport } from 'hana-music-api';

const result = await listenDataReport({
  type: 'month',
});

console.log(result.body);
```

## 返回内容

`body.code` 和通到报告的 `body.data` 收紧；周/月/年报的统计块（`listenTimeBlock`、`listenTimeDistributionBlock`、`topSongBlock`、`topArtistBlock`、`topStyleBlock`、`topAgeBlock`、`topLanguageBlock`、`vipBlock`、`wallpaperBlock`、好友块等）都是宽松字段，整块缺失或为 `null` 时原样保留，块内字段也全部宽松。月报的好友块是 `friendsListenMonthBlock` / `friendsKeyWordMonthBlock`，年报只有时间范围和 `listenTimeBlock: null`；没有收听记录的周（`listen_data_report.empty.json`）所有块都是 `null`。录制覆盖 `type=week`、`month`、`year` 和无数据周，来自登录账号（`context.viewer` 是 `authenticated`）；未登录时上游返回 `code: 302`（`listen_data_report.anonymous.json`）。

## 补充说明

说明 : 登录后调用此接口, 获取周/月/年收听报告

**必选参数 :**

`type`: 维度类型 周 week 月 month 年 year

**可选参数 :**

`endTime` : 周: 每周周六0点的时间戳 月: 每月最后一天0点的时间戳 年: 每年最后一天0点的时间戳
不填就是本周/月的, 今年没结束，则没有今年的数据

**接口地址 :** `/listen/data/report`

**调用例子 :** `/listen/data/report?type=month`
