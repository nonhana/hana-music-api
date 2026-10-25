---
title: '音乐百科 - 简要信息'
description: '调用此接口可以获取歌曲的音乐百科简要信息'
---

# 音乐百科 - 简要信息

> 调用此接口可以获取歌曲的音乐百科简要信息

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/song/wiki/summary` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `song_wiki_summary`  |
| 文档分类 | 歌曲与播放           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 ID |

## HTTP 示例

```bash
GET /song/wiki/summary?id=1958384591
```

## 编程式调用

```ts
import { songWikiSummary } from 'hana-music-api';

const result = await songWikiSummary({
  id: '1958384591',
});

console.log(result.body);
```

## 返回内容

`data.blocks` 是按 `showType` 组装的百科区块：每个区块有自己的字符串编号 `id`、`showType`、`code`、`position`、`channel`，以及由 `creatives[].resources[]` 和 `uiElement` 组成的 UI 树（标题、图片、按钮、描述、链接）。`code`、`data`、`data.blocks` 和 `data.blocks[].id` 是收紧字段，区块内容全部宽松。

只见过 `null` 的字段（`adInfo`、`blockConfig`、`md5`、`colorList` 等）没有声明，原样保留。`data.cursor` 是 JSON 字符串，`data.hasMore` 表示还有没有下一屏。未知歌曲仍返回 `code: 200`，只剩“相关歌单”一个区块。结构定义和类型是 `SongWikiSummaryBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可以获取歌曲的音乐百科简要信息

由于此接口返回内容过于复杂, 请按需取用

**接口地址:** `/song/wiki/summary`

**必选参数:** `id`: 歌曲 ID

**调用例子:** `/song/wiki/summary?id=1958384591`
