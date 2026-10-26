---
title: '音乐日历'
description: '传入开始和结束时间获取音乐日历，匿名可读'
---

# 音乐日历

> 传入开始和结束时间获取音乐日历，匿名可读

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/calendar`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否（匿名可读） |
| 对应模块 | `calendar`     |
| 文档分类 | 推荐与发现     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /calendar?startTime=1606752000000&endTime=1609430399999
```

## 编程式调用

```ts
import { calendar } from 'hana-music-api';

const result = await calendar({
  startTime: '1606752000000',
  endTime: '1609430399999',
});

console.log(result.body);
```

## 返回内容

音乐日历事件在 `data.calendarEvents`，每条事件自己的编号 `id` 收紧；`data.calendarConfig` 的按钮、事件的标题、封面、提醒和计数等展示字段宽松。结构定义和类型是 `CalendarBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 传入开始和结束时间获取音乐日历，匿名可读；不传 `startTime`/`endTime` 时 SDK 各自取当前时间，得到零长度区间，通常返回空 `calendarEvents`。本批只补结构定义，保持原有默认行为，需要事件时请显式传入范围。

**接口地址 :** `/calendar`

**调用例子 :** `/calendar?startTime=1606752000000&endTime=1609430399999`
