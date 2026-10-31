---
title: '电台 - 今日优选'
description: '登录后调用此接口, 可获得电台今日优选'
---

# 电台 - 今日优选

> 登录后调用此接口, 可获得电台今日优选

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/dj/today/perfered` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `dj_today_perfered`  |
| 文档分类 | 电台与播客           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/today/perfered
```

## 编程式调用

```ts
import { djTodayPerfered } from 'hana-music-api';

const result = await djTodayPerfered();

console.log(result.body);
```

## 返回内容

只收紧 `body.code`。`data` 在匿名、登录和 `page` 0/1/99 的探测里都是空数组，元素类型没有证据，未声明并原样保留；`msg` 只见过 `null`，同样没有声明。`data` 为空是这个账号在本批探测（含登录）里的正常结果（录制 `dj_today_perfered.empty.json`）；登录后可能返回内容，本账号/地区为空，不代表所有账号都有内容。

## 补充说明

说明 : 登录后调用此接口, 可获得电台今日优选

**接口地址 :** `/dj/today/perfered`

**调用例子 :** `/dj/today/perfered`
