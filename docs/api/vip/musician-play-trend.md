---
title: '音乐人播放趋势'
description: '音乐人登录后调用此接口 , 可获取歌曲播放趋势'
---

# 音乐人播放趋势

> 音乐人登录后调用此接口 , 可获取歌曲播放趋势

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
import { musicianPlayTrend } from 'hana-music-api'

const result = await musicianPlayTrend({
  startTime: '2021-05-24',
  endTime: '2021-05-30',
})

console.log(result.body)
```

## 补充说明

说明 : 音乐人登录后调用此接口 , 可获取歌曲播放趋势

**必选参数 :** `startTime` : 开始时间

`endTime` : 结束时间

**接口地址 :** `/musician/play/trend`

**调用例子 :** `/musician/play/trend?startTime=2021-05-24&endTime=2021-05-30`
