---
title: "DIFM电台 - 播放列表"
description: "调用此接口, 获取DIFM播放列表"
---

# DIFM电台 - 播放列表

> 调用此接口, 获取DIFM播放列表

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/dj/difm/playing/tracks/list` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `dj_difm_playing_tracks_list` |
| 文档分类 | 电台与播客 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `source` | string | ✅ | - | 来源, 0: 最嗨电音 1: 古典电台 2: 爵士电台 |
| `channelId` | string | ✅ | - | 频道id |
| `limit` | number \| string | — | 5 | 返回数量, 默认为 5 |

## HTTP 示例

```bash
GET /dj/difm/playing/tracks/list?source=0&channelId=1012
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_difm_playing_tracks_list({
  source: "0",
  channelId: "1012",
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 获取DIFM播放列表

**必选参数 :**  

`source`: 来源, 0: 最嗨电音 1: 古典电台 2: 爵士电台

`channelId`: 频道id

**可选参数 :**

`limit`: 返回数量, 默认为 5

**接口地址:** `/dj/difm/playing/tracks/list`

**调用例子:** `/dj/difm/playing/tracks/list?source=0&channelId=1012`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
