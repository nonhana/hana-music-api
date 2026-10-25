---
title: '获取精品歌单'
description: '调用此接口，可获取精品歌单'
---

# 获取精品歌单

> 调用此接口，可获取精品歌单

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/top/playlist/highquality` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `top_playlist_highquality`  |
| 文档分类 | 歌单                        |

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                                                                           |
| -------- | ------------------ | :--: | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `cat`    | string[] \| string |  —   | 为     | tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为<br>"全部",可从精品歌单标签列表接口获取(`/playlist/highquality/tags`) |
| `limit`  | number \| string   |  —   | 50     | 取出歌单数量，默认为 50                                                                                                        |
| `before` | number \| string   |  —   | -      | 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据                                                                    |

## HTTP 示例

```bash
GET /top/playlist/highquality?before=1503639064232&limit=3
```

## 编程式调用

```ts
import { topPlaylistHighquality } from 'hana-music-api';

const result = await topPlaylistHighquality({
  before: '1503639064232',
  limit: '3',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.playlists` 和每个歌单的 `id` 收紧；歌单摘要共用 `PlaylistSummary`，并局部声明了宽松的 `copywriter`、`tag`。`total`、`lasttime`、`more` 是分页提示，`msg` 是状态信息，全部宽松。游标 `before` 早于所有歌单的 `updateTime` 时返回真实的空结果：`playlists: []`、`more: false`，并带 `msg: "没有获取数据"`；空结果没有 `lasttime`。`recommendInfo` 由 `PlaylistSummary` 声明为宽松字段；只出现过 `null` 的 `recommendText`、`socialPlaylistCover` 等没有声明，原样保留。结构定义和类型是 `TopPlaylistHighqualityBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取精品歌单

**可选参数 :** `cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
"全部",可从精品歌单标签列表接口获取(`/playlist/highquality/tags`)

`limit`: 取出歌单数量，默认为 50

`before`: 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据

**接口地址 :** `/top/playlist/highquality`

**调用例子 :** `/top/playlist/highquality?before=1503639064232&limit=3`
