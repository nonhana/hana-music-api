---
title: '曲风-歌单'
description: '调用此接口可以获取该曲风对应的歌单'
---

# 曲风-歌单

> 调用此接口可以获取该曲风对应的歌单

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/style/playlist` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `style_playlist`  |
| 文档分类 | 曲风              |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                          |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------------- |
| `tagId`  | string           |  ✅  | -      | 曲风 ID                                                                       |
| `size`   | number \| string |  —   | 20     | 返回数量，默认为 20                                                           |
| `cursor` | number \| string |  —   | 0      | 返回数据的 cursor, 默认为 0，传入上一次返回结果的 cursor,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /style/playlist?tagId=1000
```

## 编程式调用

```ts
import { stylePlaylist } from 'hana-music-api';

const result = await stylePlaylist({
  tagId: '1000',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data.playlist` 和每个歌单自己的编号 `data.playlist[].id` 收紧：`data.playlist` 是通到曲风歌单的路径。歌单摘要里的 `name`、`cover`、`songCount`、`playCount` 宽松；创建者的 `userId`、`userName` 也宽松，创建者编号不算歌单自己的编号。`body.data.page` 是分页提示，全部宽松。未知曲风 id 返回空数组（录制 `style_playlist.unknown-tag.json`）。

## 补充说明

说明: 调用此接口可以获取该曲风对应的歌单

**接口地址:** `/style/playlist`

**必选参数:** `tagId`: 曲风 ID

**可选参数 :** `size` : 返回数量，默认为 20

`cursor` : 返回数据的 cursor, 默认为 0，传入上一次返回结果的 cursor,将会返回下一页的数据

**调用例子:** `/style/playlist?tagId=1000`
