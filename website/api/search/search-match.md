---
title: '本地歌曲文件匹配网易云歌曲信息'
description: '调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息'
---

# 本地歌曲文件匹配网易云歌曲信息

> 调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/search/match` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `search_match`  |
| 文档分类 | 搜索            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /search/match?title=富士山下&album=&artist=陈奕迅&duration=259.21&md5=bd708d006912a09d827f02e754cf8e56
```

## 编程式调用

```ts
import { searchMatch } from 'hana-music-api';

const result = await searchMatch({
  title: '富士山下',
  album: '',
  artist: '陈奕迅',
  duration: '259.21',
  md5: 'bd708d006912a09d827f02e754cf8e56',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.result`、`body.result.songs` 和 `body.result.ids` 收紧；每首匹配歌曲的 `id` 收紧；`ids` 是接口要返回的本地文件映射项，和歌曲 `id` 一起收紧。歌曲共用 `Song`，旧式歌曲字段（`popularity`、`score`、`position`、`hMusic`、`mMusic`、`lMusic`、`bMusic` 等）是宽松字段。空结果录制 `search_match.no-result.json` 是 `songs: []`、`ids: []`。结构定义和类型是 `SearchMatchBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息

**必选参数：**

`title`: 文件的标题信息，是文件属性里的标题属性，并非文件名

`album`: 文件的专辑信息

`artist`: 文件的艺术家信息

`duration`: 文件的时长，单位为秒

`md5`: 文件的md5

**接口地址:** `/search/match`

**调用例子:** `/search/match?title=富士山下&album=&artist=陈奕迅&duration=259.21&md5=bd708d006912a09d827f02e754cf8e56`
