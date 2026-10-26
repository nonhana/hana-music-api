---
title: '已购买单曲'
description: '调用此接口, 可获得当前账号已购买单曲'
---

# 已购买单曲

> 调用此接口, 可获得当前账号已购买单曲

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/song/singledownlist` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `song_singledownlist`  |
| 文档分类 | 歌曲与播放             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 20     | 返回数量，默认为 20                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /song/singledownlist
```

## 编程式调用

```ts
import { songSingledownlist } from 'hana-music-api';

const result = await songSingledownlist();

console.log(result.body);
```

## 返回内容

只收紧 `code`。`body.info` 是已购买单曲列表；录制账号没有已购买单曲，`info` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留（录制 `song_singledownlist.empty.json`）。结构定义和类型是 `SongSingledownlistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口, 可获得当前账号已购买单曲

**可选参数 :**

`limit` : 返回数量，默认为 20

`offset` : 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/song/singledownlist`

**调用例子 :** `/song/singledownlist`
