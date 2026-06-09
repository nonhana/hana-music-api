---
title: '相关歌单推荐'
description: '调用此接口, 传入歌单id, 获取相关歌单推荐'
---

# 相关歌单推荐

> 调用此接口, 传入歌单id, 获取相关歌单推荐

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/playlist/detail/rcmd/get` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `playlist_detail_rcmd_get`  |
| 文档分类 | 歌单                        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/detail/rcmd/get?id=8039587836
```

## 编程式调用

```ts
import { playlistDetailRcmdGet } from 'hana-music-api'

const result = await playlistDetailRcmdGet({
  id: '8039587836',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 传入歌单id, 获取相关歌单推荐

**必选参数：**

`id`: 歌单id

**接口地址:** `/playlist/detail/rcmd/get`

**调用例子:** `/playlist/detail/rcmd/get?id=8039587836`
