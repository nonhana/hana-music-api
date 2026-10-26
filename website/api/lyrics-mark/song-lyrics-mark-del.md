---
title: '歌词摘录 - 删除摘录歌词'
description: '登录后调用此接口, 传入摘录歌词id, 删除摘录歌词'
---

# 歌词摘录 - 删除摘录歌词

> 登录后调用此接口, 传入摘录歌词id, 删除摘录歌词

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/song/lyrics/mark/del` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 是                      |
| 对应模块 | `song_lyrics_mark_del`  |
| 文档分类 | 歌词摘录                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /song/lyrics/mark?id=2083850
```

## 编程式调用

```ts
import { songLyricsMarkDel } from 'hana-music-api';

const result = await songLyricsMarkDel({
  id: '2083850',
});

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`，删除结果 `body.data` 和 `data.success` 收紧；`message` 宽松。删除已不存在的摘录时返回码仍是 `200`，只有 `success` 变成 `false`（录制 `song_lyrics_mark_del.del-again.json`），调用方要按 `success` 判断有没有删到。结构定义和类型是 `SongLyricsMarkDelBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 登录后调用此接口, 传入摘录歌词id, 删除摘录歌词

**必选参数：**

`id`: 摘录歌词id

**接口地址:** `/song/lyrics/mark/del`

**调用例子:** `/song/lyrics/mark?id=2083850`
