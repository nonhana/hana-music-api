---
title: '获取相似歌单'
description: '调用此接口，传入歌曲 id, 可获得相似歌单'
---

# 获取相似歌单

> 调用此接口，传入歌曲 id, 可获得相似歌单

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/simi/playlist` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `simi_playlist`  |
| 文档分类 | 推荐与发现       |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /simi/playlist?id=347230
```

## 编程式调用

```ts
import { simiPlaylist } from 'hana-music-api';

const result = await simiPlaylist({
  id: '347230',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.playlists` 和每个歌单的 `body.playlists[].id` 收紧；歌单记录复用 `PlaylistSummary`，`name`、`coverImgUrl`、`trackCount`、`playCount`、`subscribed`、`creator`、`tracks` 等宽松，相似歌单多出的 `alg`、`recommendReason`、`extProperties` 等推荐字段另声明为宽松字段。未知歌曲 id 返回空数组（`simi_playlist.unknown.json`）；缺少 `id` 时上游是 HTTP 400 空正文，SDK 归一成 `status: 200`、`body` 为空字符串原样返回，不报 502。本页录制来自登录账号（`context.viewer` 是 `authenticated`），没有保留匿名对照录制。

## 补充说明

说明 : 调用此接口，传入歌曲 id, 可获得相似歌单

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/simi/playlist`

**调用例子 :** `/simi/playlist?id=347230` ( 对应 ' 光辉岁月 ' 相似歌单 )
