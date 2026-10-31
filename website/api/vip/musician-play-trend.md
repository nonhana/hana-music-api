---
title: '音乐人播放趋势'
description: '音乐人登录后调用此接口，可获取歌曲播放趋势'
---

# 音乐人播放趋势

> 音乐人登录后调用此接口，可获取歌曲播放趋势

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/musician/play/trend` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 是                     |
| 对应模块 | `musician_play_trend`  |
| 文档分类 | 会员与云贝             |

## 请求参数

| 参数        | 类型   | 必填 | 默认值 | 说明     |
| ----------- | ------ | :--: | ------ | -------- |
| `startTime` | string |  ✅  | -      | 开始时间 |
| `endTime`   | string |  ✅  | -      | 结束时间 |

## HTTP 示例

```bash
GET /musician/play/trend?startTime=2021-05-24&endTime=2021-05-30
```

## 编程式调用

```ts
import { musicianPlayTrend } from 'hana-music-api';

const result = await musicianPlayTrend({
  startTime: '2021-05-24',
  endTime: '2021-05-30',
});

console.log(result.body);
```

## 返回内容

`body.code`、趋势数组 `body.data`、日期键 `body.data[].dateTime` 和每天的播放数 `body.data[].dataValue` 收紧，播放数是字符串（`"0"` 也正常）。`startTime`/`endTime` 传 `YYYY-MM-DD` 字符串；毫秒数、秒数或缺少参数会返回 `code: 400`（`musician_play_trend.ms-params.json`、`musician_play_trend.s-params.json`、`musician_play_trend.no-params.json`），SDK 以 `status: 400` 转交原文。没有播放记录的区间返回 `data: []`（`musician_play_trend.empty.json`），匿名调用也返回空趋势（`musician_play_trend.anonymous-empty.json`）。录制来自音乐人账号（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `anonimousUser: false`（未落盘））。结构定义和类型是 `MusicianPlayTrendBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 音乐人登录后调用此接口，可获取歌曲播放趋势

**必选参数 :** `startTime` : 开始时间

`endTime` : 结束时间

**接口地址 :** `/musician/play/trend`

**调用例子 :** `/musician/play/trend?startTime=2021-05-24&endTime=2021-05-30`
