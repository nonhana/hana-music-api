---
title: '歌单分类'
description: '调用此接口,可获取歌单分类,包含 category 信息'
---

# 歌单分类

> 调用此接口,可获取歌单分类,包含 category 信息

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/playlist/catlist` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `playlist_catlist`  |
| 文档分类 | 歌单                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/catlist
```

## 编程式调用

```ts
import { playlistCatlist } from 'hana-music-api'

const result = await playlistCatlist()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取歌单分类,包含 category 信息

**接口地址 :** `/playlist/catlist`

**调用例子 :** `/playlist/catlist`
