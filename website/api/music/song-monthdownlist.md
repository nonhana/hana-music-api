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

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 20     | 返回数量，默认为 20                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /song/monthdownlist
```

## 编程式调用

```ts
import { songMonthdownlist } from 'hana-music-api';

const result = await songMonthdownlist();

console.log(result.body);
```

## 返回内容

`body.info` 是本月下载记录列表，每条记录只收紧自己的编号 `info[].id`（以及 `code`、`info`）；内嵌歌曲 `song` 用宽松的 `LooseSong`（歌曲 `id` 也宽松），`firstTime`、`type` 宽松。

`offset` 越过末尾时 `info` 是空数组（录制 `song_monthdownlist.empty.json`）；匿名调用同样是空 `info`，下载记录只在登录后出现。结构定义和类型是 `SongMonthdownlistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口, 可获得当前账号会员本月下载歌曲记录

**可选参数 :**

`limit` : 返回数量，默认为 20

`offset` : 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/song/monthdownlist`

**调用例子 :** `/song/monthdownlist`
