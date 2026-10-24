---
title: '获取歌手详情'
description: '调用此接口，传入歌手 id, 可获得获取歌手详情'
---

# 获取歌手详情

> 调用此接口，传入歌手 id, 可获得获取歌手详情

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/artist/detail` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `artist_detail`  |
| 文档分类 | 歌手             |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /artist/detail?id=11972054
```

## 编程式调用

```ts
import { artistDetail } from 'hana-music-api';

const result = await artistDetail({
  id: '11972054',
});

console.log(result.body);
```

## 返回内容

正文带 `code`、`message` 和歌手详情的 `data`。只有 `code`、`data`、`data.artist`、`data.artist.id` 收紧；`message` 和 `data` 里的其他字段宽松，`data.artist` 里除编号外的字段也宽松。结构定义和类型是 `ArtistDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入歌手 id, 可获得获取歌手详情

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/artist/detail`

**调用例子 :** `/artist/detail?id=11972054` (Billie Eilish)
