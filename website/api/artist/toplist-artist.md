---
title: '歌手榜'
description: '调用此接口，可获取排行榜中的歌手榜'
---

# 歌手榜

> 调用此接口，可获取排行榜中的歌手榜

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/toplist/artist` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `toplist_artist`  |
| 文档分类 | 歌手              |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                             |
| ------ | ------ | :--: | ------ | ------------------------------------------------ |
| `type` | string |  —   | -      | 地区<br>1: 华语<br>2: 欧美<br>3: 韩国<br>4: 日本 |

## HTTP 示例

```bash
GET /toplist/artist
```

## 编程式调用

```ts
import { toplistArtist } from 'hana-music-api';

const result = await toplistArtist();

console.log(result.body);
```

## 返回内容

`body.code`、`body.list`、`list.artists` 和每个歌手的 `id` 收紧。歌手记录沿用 `Artist` 的宽松字段，在模块内局部收紧了 `id`，并声明了宽松的 `lastRank`、`score`。本批 type=1 录制里有一条歌手缺少 `lastRank`，也保留在截取后的证据里；上游可能缺失或给 `null`，两种都按宽松字段处理（`lastRank` 的类型是 `number | null | undefined`）。`list.type` 是请求的地区类型，不是记录编号，和 `list.updateTime` 一起保持宽松。接口固定 `limit: 100`、`offset: 0`，没有空结果路径。结构定义和类型是 `ToplistArtistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取排行榜中的歌手榜

**可选参数 :**

```text
type : 地区
1: 华语
2: 欧美
3: 韩国
4: 日本
```

**接口地址 :** `/toplist/artist`

**调用例子 :** `/toplist/artist`
