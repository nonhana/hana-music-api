---
title: '所有榜单'
description: '调用此接口,可获取所有榜单'
---

# 所有榜单

> 调用此接口,可获取所有榜单

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/toplist`     |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `toplist`      |
| 文档分类 | 排行榜         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /toplist
```

## 编程式调用

```ts
import { toplist } from 'hana-music-api';

const result = await toplist();

console.log(result.body);
```

## 返回内容

`body.code`、`body.list` 和每个榜单的 `id` 收紧；榜单摘要共用 `PlaylistSummary`，并局部补了宽松的 `tsSongCount`、`originalCoverId`，其余声明字段宽松（`subscribed`、`creator`、`tracks` 可能缺失或为 `null`，都原样返回）。附带的 `body.artistToplist` 整体宽松：`coverUrl`、`name`、`position`、`upateFrequency`、`updateFrequency` 都是宽松字段，整块类型不对时只丢这一块。录制里只出现过 `null` 的字段（如 `list[].algType`、`list[].artists`、`list[].topTrackIds`）没有声明，原样保留；`list[].trackIds` 在这个摘要接口里缺失，也没有声明。榜单列表没有空结果。结构定义和类型是 `ToplistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取所有榜单
**接口地址 :** `/toplist`

**调用例子 :** `/toplist`
