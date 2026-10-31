---
title: '歌词摘录 - 歌词摘录信息'
description: '登录后调用此接口, 传入歌曲id, 获取歌词摘录信息'
---

# 歌词摘录 - 歌词摘录信息

> 登录后调用此接口, 传入歌曲id, 获取歌词摘录信息

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/song/lyrics/mark` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 是                  |
| 对应模块 | `song_lyrics_mark`  |
| 文档分类 | 歌词摘录            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /song/lyrics/mark?id=2058263032
```

## 编程式调用

```ts
import { songLyricsMark } from 'hana-music-api';

const result = await songLyricsMark({
  id: '2058263032',
});

console.log(result.body);
```

## 返回内容

`data` 是这首歌的歌词摘录信息，`code`、`data` 是收紧字段；`message` 是宽松字段。`markVOList`、`markCountList` 在本次录制账号上都是空数组，元素类型没有证据，没有声明，原样保留。

匿名和登录调用在本次录制里返回相同的空列表。摘录记录的形状要等有摘录内容的录制；写入操作 `song_lyrics_mark_add`、`song_lyrics_mark_del` 在后续批次处理，本批没有收窄它们的返回体。结构定义和类型是 `SongLyricsMarkBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 登录后调用此接口, 传入歌曲id, 获取歌词摘录信息

**必选参数：**

`id`: 歌曲id

**接口地址:** `/song/lyrics/mark`

**调用例子:** `/song/lyrics/mark?id=2058263032`
