---
title: '会员本月下载歌曲记录'
description: '调用此接口, 可获得当前账号会员本月下载歌曲记录'
---

# 会员本月下载歌曲记录

> 调用此接口, 可获得当前账号会员本月下载歌曲记录

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/song/monthdownlist` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `song_monthdownlist`  |
| 文档分类 | 歌曲与播放            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                     |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------ |
| `limit`  | number \| string |  —   | 20     | 返回数量 , 默认为 20                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0 |

## HTTP 示例

```bash
GET /song/monthdownlist
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_monthdownlist()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口, 可获得当前账号会员本月下载歌曲记录

**可选参数 :**

`limit` : 返回数量 , 默认为 20

`offset` : 偏移数量，用于分页 ,如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/song/monthdownlist`

**调用例子 :** `/song/monthdownlist`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
