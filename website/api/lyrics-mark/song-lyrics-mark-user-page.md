---
title: '歌词摘录 - 我的歌词本'
description: '登录后调用此接口, 获取我的歌词本'
---

# 歌词摘录 - 我的歌词本

> 登录后调用此接口, 获取我的歌词本

## 接口信息

| 项目     | 值                            |
| -------- | ----------------------------- |
| 接口地址 | `/song/lyrics/mark/user/page` |
| 请求方式 | `GET` / `POST`                |
| 需要登录 | 是                            |
| 对应模块 | `song_lyrics_mark_user_page`  |
| 文档分类 | 歌词摘录                      |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 20     | 返回数量，默认为 20                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /song/lyrics/mark/user/page
```

## 编程式调用

```ts
import { songLyricsMarkUserPage } from 'hana-music-api';

const result = await songLyricsMarkUserPage();

console.log(result.body);
```

## 返回内容

`data` 是我的歌词本：`offset` 是返回的偏移量，`hasMore` 表示还有没有下一页，`markVOList` 是摘录列表。`code`、`data` 是收紧字段，`offset`、`hasMore` 是宽松字段；`markVOList` 在本次录制账号上是空数组，元素类型没有证据，没有声明，原样保留。`message` 是宽松字段。

匿名和登录调用在本次录制里返回相同的空列表。结构定义和类型是 `SongLyricsMarkUserPageBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 登录后调用此接口, 获取我的歌词本

**可选参数 :**

`limit` : 返回数量，默认为 20

`offset` : 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址:** `/song/lyrics/mark/user/page`

**调用例子:** `/song/lyrics/mark/user/page`
