---
title: '已购单曲'
description: '登录后调用此接口可获取已购买的单曲'
---

# 已购单曲

> 登录后调用此接口可获取已购买的单曲

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/song/purchased` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `song_purchased`  |
| 文档分类 | 歌曲与播放        |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                              |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                           |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*10, 其中 10 为 limit 的值 |

## HTTP 示例

```bash
GET /song/purchased?limit=10
```

## 编程式调用

```ts
import { songPurchased } from 'hana-music-api';

const result = await songPurchased({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`code` 和已购单曲列表的路径 `data` 收紧；`data.count`、`data.hasMore` 和 `message` 宽松。`data.list` 是已购单曲列表，录制账号没有已购单曲，只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留（录制 `song_purchased.empty.json`）。结构定义和类型是 `SongPurchasedBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 :登录后调用此接口可获取已购买的单曲

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*10, 其中 10 为 limit 的值

**接口地址 :** `/song/purchased`

**调用例子 :** `/song/purchased?limit=10`
