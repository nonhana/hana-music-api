---
title: '关注歌手新 MV'
description: '登录后调用此接口可获取关注歌手新 MV'
---

# 关注歌手新 MV

> 登录后调用此接口可获取关注歌手新 MV

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/artist/new/mv` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `artist_new_mv`  |
| 文档分类 | 歌手             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                |
| -------- | ---------------- | :--: | ------ | ----------------------------------- |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20             |
| `before` | number \| string |  —   | -      | 上一页数据返回的 publishTime 的数据 |

## HTTP 示例

```bash
GET /artist/new/mv?limit=1
GET /artist/new/mv?limit=1&before=1602777625000
```

## 编程式调用

```ts
import { artistNewMv } from 'hana-music-api';

const result = await artistNewMv({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data` 和 MV 自己的编号 `data.newWorks[].mvId` 收紧；`data.hasMore`、`message` 宽松。`data.newWorks` 是收紧的数组：匿名访问返回空数组（录制 `artist_new_mv.anonymous-empty.json`），这是正常结果；缺失、`null` 或坏一条记录都报 502。登录录制有 17 个 MV（`artist_new_mv.default.json`），`artistId`、`artistName`、`artistImgUrl`、`mvName`、`playCount`、`duration`、`mvCoverUrl`、`publishTime`、`publishDate`、`artisAlias`、`artisTransName` 都是宽松字段。结构定义和类型是 `ArtistNewMvBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 :登录后调用此接口可获取关注歌手新 MV

**可选参数 :** `limit`: 取出评论数量，默认为 20

`before`: 上一页数据返回的 publishTime 的数据

**接口地址 :** `/artist/new/mv`

**调用例子 :** `/artist/new/mv?limit=1` `/artist/new/mv?limit=1&before=1602777625000`
