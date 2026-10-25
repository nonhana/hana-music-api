---
title: '最新专辑'
description: '调用此接口 ，获取云音乐首页新碟上架数据'
---

# 最新专辑

> 调用此接口 ，获取云音乐首页新碟上架数据

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/album/newest` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `album_newest`  |
| 文档分类 | 专辑            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /album/newest
```

## 编程式调用

```ts
import { albumNewest } from 'hana-music-api';

const result = await albumNewest();

console.log(result.body);
```

## 返回内容

`body.code`、`body.albums` 和每张专辑的 `albums[].id` 收紧；专辑记录共用 `AlbumSummary`，其余声明字段宽松。这个接口没有分页参数；本批录制与探测未发现可达的空结果，`albums` 数组本身允许为空；专辑里的 `songs` 只见过 `null`，没有声明，原样保留。结构定义和类型是 `AlbumNewestBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口 ，获取云音乐首页新碟上架数据

**接口地址 :** `/album/newest`

**调用例子 :** `/album/newest`
