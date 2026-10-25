---
title: '歌单更新播放量'
description: '调用后可更新歌单播放量'
---

# 歌单更新播放量

> 调用后可更新歌单播放量

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/playlist/update/playcount` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `playlist_update_playcount`  |
| 文档分类 | 歌单                         |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌单 id |

## HTTP 示例

```bash
GET /playlist/update/playcount?id=24381616
```

## 编程式调用

```ts
import { playlistUpdatePlaycount } from 'hana-music-api';

const result = await playlistUpdatePlaycount({
  id: '24381616',
});

console.log(result.body);
```

## 返回内容

写操作：给 `id` 指定的歌单增加播放计数。接口只返回返回码，收紧的是 `code`；歌单不存在时也回 `code: 200` 并接受计数写入，删除只把歌单移出用户歌单列表，元数据并未抹除。缺少 `id` 时上游回 HTTP 400 空正文，SDK 归一成 `status: 200` 和空字符串，结构定义把空字符串作为独立分支保留。结构定义和类型是 `PlaylistUpdatePlaycountBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用后可更新歌单播放量

**必选参数 :** `id` : 歌单 id

**接口地址 :** `/playlist/update/playcount`

**调用例子 :** `/playlist/update/playcount?id=24381616`
