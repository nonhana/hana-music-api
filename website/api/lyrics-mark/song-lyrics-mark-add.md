---
title: '歌词摘录 - 添加/修改摘录歌词'
description: '登录后调用此接口, 传入歌曲id, 可以添加/修改摘录歌词'
---

# 歌词摘录 - 添加/修改摘录歌词

> 登录后调用此接口, 传入歌曲id, 可以添加/修改摘录歌词

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/song/lyrics/mark/add` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 是                      |
| 对应模块 | `song_lyrics_mark_add`  |
| 文档分类 | 歌词摘录                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /song/lyrics/mark/add
```

## 编程式调用

```ts
import { songLyricsMarkAdd } from 'hana-music-api';

const result = await songLyricsMarkAdd();

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`，摘录结果 `body.data` 和这条摘录自己的 `data.markId` 收紧；`data.success`、`data.updateTime` 和 `message` 宽松。`markId` 为空串时新建摘录，带已有 `markId` 时修改同一条，两种调用返回同一结构（录制 `song_lyrics_mark_add.add.json`、`song_lyrics_mark_add.add-update.json`），写入结果用 [歌词摘录信息](/api/lyrics-mark/song-lyrics-mark) 回读确认。结构定义和类型是 `SongLyricsMarkAddBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 登录后调用此接口, 传入歌曲id, 可以添加/修改摘录歌词

**必选参数：**

`id`: 歌曲id

`data`: 存储歌词摘录信息的对象数组的字符串，如:

```javascript
let data = encodeURIComponent(
  JSON.stringify([
    {
      translateType: 1,
      startTimeStamp: 800,
      translateLyricsText: '让我逃走吧、声音已经枯萎',
      originalLyricsText: '逃がし てくれって声を枯らした',
    },
  ]),
);
```

若需要修改摘录信息, 则需要填入参数`markId`, 修改对应的摘录信息

**接口地址:** `/song/lyrics/mark/add`
