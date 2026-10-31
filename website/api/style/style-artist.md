---
title: '曲风-歌手'
description: '调用此接口可以获取该曲风对应的歌手'
---

# 曲风-歌手

> 调用此接口可以获取该曲风对应的歌手

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/style/artist` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `style_artist`  |
| 文档分类 | 曲风            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                          |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------------- |
| `tagId`  | string           |  ✅  | -      | 曲风 ID                                                                       |
| `size`   | number \| string |  —   | 20     | 返回数量，默认为 20                                                           |
| `cursor` | number \| string |  —   | 0      | 返回数据的 cursor, 默认为 0，传入上一次返回结果的 cursor,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /style/artist?tagId=1000
```

## 编程式调用

```ts
import { styleArtist } from 'hana-music-api';

const result = await styleArtist({
  tagId: '1000',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data.artists` 和每个歌手自己的编号 `data.artists[].id` 收紧：`data.artists` 是通到曲风歌手的路径。歌手记录复用宽松的 `Artist`，额外声明宽松的 `fansCount`；`awardTags` 在录制里只见过 `null`，没有声明。`body.data.page` 是分页提示（`cursor`、`size`、`more`、`total`），全部宽松。未知曲风 id 返回空数组（录制 `style_artist.unknown-tag.json`）。

## 补充说明

说明: 调用此接口可以获取该曲风对应的歌手

**接口地址:** `/style/artist`

**必选参数:** `tagId`: 曲风 ID

**可选参数 :** `size` : 返回数量，默认为 20

`cursor` : 返回数据的 cursor, 默认为 0，传入上一次返回结果的 cursor,将会返回下一页的数据

**调用例子:** `/style/artist?tagId=1000`
