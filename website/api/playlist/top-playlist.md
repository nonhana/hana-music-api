---
title: '歌单 ( 网友精选碟 )'
description: '调用此接口，可获取网友精选碟歌单'
---

# 歌单 ( 网友精选碟 )

> 调用此接口，可获取网友精选碟歌单

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/top/playlist` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `top_playlist`  |
| 文档分类 | 歌单            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                                                        |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------------------------------------------- |
| `order`  | string           |  —   | 为     | 可选值为 'new' 和 'hot', 分别对应最新和最热，默认为<br>'hot'                                                |
| `cat`    | string           |  —   | 为     | tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为<br>"全部",可从歌单分类接口获取(/playlist/catlist) |
| `limit`  | number \| string |  —   | 50     | 取出歌单数量，默认为 50                                                                                     |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*50, 其中 50 为 limit 的值                                           |

## HTTP 示例

```bash
GET /top/playlist?limit=10&order=new
```

## 编程式调用

```ts
import { topPlaylist } from 'hana-music-api';

const result = await topPlaylist({
  limit: '10',
  order: 'new',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.playlists` 和每个歌单自己的编号 `playlists[].id` 收紧；歌单摘要共用 `PlaylistSummary`，并局部声明了宽松的 `alg`、`backgroundImageId`、`originalCoverId`、`tsSongCount`。`total`、`more` 和回显的 `cat` 是分页/查询提示，全部宽松。

上游原文里的 `avatarImgId_str`（`creator`、`subscribers[]`）只在成功返回体里改写成 `avatarImgIdStr`，所以 `body` 描述的是改写后的最终体；录制保存上游原文，契约测试用显式转换比较。`code: 404` 等业务拒绝的正文原样透传，不做改写。

`order=new` 返回真实空结果：`playlists: []`、`total: 0`、`more: false`（录制 `top_playlist.empty.json`）。`order=hot` 下 `offset=680` 是真实尾页（6 条，含 `14089582600`，`more: false`，录制 `top_playlist.last-page.json`）；`offset>=686` 返回本批录制里的另一份固定 6 条兜底列表（`18271967084` 等，与尾页不同，`limit` 不生效，`more: true`，录制 `top_playlist.beyond-last-page.json`、`top_playlist.fallback-ignores-limit.json`）。`playlists` 数组本身允许为空。

`limit`/`offset` 等非数字参数时上游回 HTTP 400 和空字符串正文，网易云把它归一成 `status: 200`、`body: ''`；结构定义把空字符串作为独立分支保留，不报 502（录制 `top_playlist.invalid-limit.json`）。登录与匿名返回相同顶层键，条目顺序和值因个性化不同；登录录制里出现 `subscribed: true`，`creator.experts` 的键 `1`、`2` 都出现过；匿名只有键 `2`（`top_playlist.anonymous.json`）。结构定义和类型是 `TopPlaylistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取网友精选碟歌单

**可选参数 :** `order`: 可选值为 'new' 和 'hot', 分别对应最新和最热，默认为
'hot'

`cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
"全部",可从歌单分类接口获取(/playlist/catlist)

`limit`: 取出歌单数量，默认为 50

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/top/playlist`

**调用例子 :** `/top/playlist?limit=10&order=new`
