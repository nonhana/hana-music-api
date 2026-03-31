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
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.musician_play_trend({
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

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
