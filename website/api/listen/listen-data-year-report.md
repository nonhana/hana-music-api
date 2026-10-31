---
title: '听歌足迹 - 年度听歌足迹'
description: '登录后调用此接口, 获取年度听歌足迹'
---

# 听歌足迹 - 年度听歌足迹

> 登录后调用此接口, 获取年度听歌足迹

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/listen/data/year/report` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `listen_data_year_report`  |
| 文档分类 | 听歌记录                   |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /listen/data/year/report
```

## 编程式调用

```ts
import { listenDataYearReport } from 'hana-music-api';

const result = await listenDataYearReport();

console.log(result.body);
```

## 返回内容

`body.code`、通到年度听歌足迹列表的 `body.data.yearItems` 和每年的 `body.data.yearItems[].year` 收紧；`displayYear`、`playNum`、`playDuration` 宽松。列表本身允许为空数组，`[]` 是构造边界；本批只有一个有数据的登录账号，空账号下 `data`/列表的实际表现未验证。本页录制来自登录账号（`context.viewer` 是 `authenticated`）；未登录时上游返回 `code: 302`（`listen_data_year_report.anonymous.json`）。

## 补充说明

说明 : 登录后调用此接口, 获取年度听歌足迹

**接口地址 :** `/listen/data/year/report`
