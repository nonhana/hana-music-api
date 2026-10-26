---
title: '年度听歌报告'
description: '登录后调用此接口,使用此接口,可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告'
---

# 年度听歌报告

> 登录后调用此接口,使用此接口,可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/summary/annual` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `summary_annual`  |
| 文档分类 | 听歌记录          |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /summary/annual?year=2024
```

## 编程式调用

```ts
import { summaryAnnual } from 'hana-music-api';

const result = await summaryAnnual({
  year: '2024',
});

console.log(result.body);
```

## 返回内容

`body.code` 和通到年度报告的 `body.data` 收紧；报告正文按年份整体变化（2020 年起是长键，2017–2019 年走 `userdata` 短键），已声明字段全部宽松，未声明字段原样保留。本批保留 2018、2019（`userdata` 短键）和 2022、2023（`data` 长键）的录制（`summary_annual.2018.json`、`.2019.json`、`.2022.json`、`.2023.json`），其他年份未验证；2018 的评论正文 `data.mlc` 是字符串，按 `number | string` 的宽松字段声明。没有报告的 2025 返回 `code: 404` 和“接口未找到”，按业务拒绝原样转交（`summary_annual.no-report.json`），不产出成功结构。结构定义和类型是 `SummaryAnnualBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 登录后调用此接口,使用此接口,可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告

**必选参数：**

`year`: 报告年份

**接口地址:** `/summary/annual`

**调用例子:** `/summary/annual?year=2024`
