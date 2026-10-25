---
title: '歌手详情动态'
description: '调用后可获取歌手详情动态部分,如是否关注,视频数'
---

# 歌手详情动态

> 调用后可获取歌手详情动态部分,如是否关注,视频数

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/artist/detail/dynamic` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 否                       |
| 对应模块 | `artist_detail_dynamic`  |
| 文档分类 | 歌手                     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /artist/detail/dynamic?id=15396
```

## 编程式调用

```ts
import { artistDetailDynamic } from 'hana-music-api';

const result = await artistDetailDynamic({
  id: '15396',
});

console.log(result.body);
```

## 返回内容

只有 `body.code` 收紧；`followed`（是否关注）、`concert`（演出）、`videoNum`（视频数）和 `rcmdResource`（推荐资源）都是宽松字段。录制里 `concert.simpleConcert`、`rcmdResource.picUrl`、`rcmdResource.resId` 只出现过 `null`，没有声明，继续原样保留。结构定义和类型是 `ArtistDetailDynamicBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用后可获取歌手详情动态部分,如是否关注,视频数

**必选参数 :** `id` : 歌手 id

**接口地址 :** `/artist/detail/dynamic`

**调用例子 :** `/artist/detail/dynamic?id=15396`
