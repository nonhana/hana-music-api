---
title: '所有榜单内容摘要'
description: '调用此接口,可获取所有榜单内容摘要'
---

# 所有榜单内容摘要

> 调用此接口,可获取所有榜单内容摘要

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/toplist/detail` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `toplist_detail`  |
| 文档分类 | 排行榜            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /toplist/detail
```

## 编程式调用

```ts
import { toplistDetail } from 'hana-music-api';

const result = await toplistDetail();

console.log(result.body);
```

## 返回内容

`body.code`、`body.list` 和每个榜单的 `id` 收紧；榜单摘要共用 `PlaylistSummary`，并局部补了宽松的 `tsSongCount`、`originalCoverId`，`list[].trackIds` 在这个摘要接口里缺失，没有声明。`artistToplist`（含 `artists[]` 的 `first`、`second`、`third`）和 `rewardToplist`（含 `songs`）是附加入口，整块宽松：类型不对时只丢这一块；`rewardToplist.songs` 里的歌曲对象没有逐字段声明，原样保留。`list[].tracks` 在这里是榜单前几首歌的 `{ first, second }` 摘要，不是完整歌曲，按 `PlaylistSummary` 的宽松 `tracks` 保留。榜单摘要没有空结果。结构定义和类型是 `ToplistDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取所有榜单内容摘要

**接口地址 :** `/toplist/detail`

**调用例子 :** `/toplist/detail`
