---
title: '歌手简要百科信息'
description: '登录后调用此接口,使用此接口,传入歌手id,可获取对应的歌手简要百科信息'
---

# 歌手简要百科信息

> 登录后调用此接口,使用此接口,传入歌手id,可获取对应的歌手简要百科信息

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/ugc/artist/get` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `ugc_artist_get`  |
| 文档分类 | 百科与用户贡献    |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/artist/get?id=15396
```

## 编程式调用

```ts
import { ugcArtistGet } from 'hana-music-api';

const result = await ugcArtistGet({
  id: '15396',
});

console.log(result.body);
```

## 返回内容

`body.code`、歌手百科记录的路径 `body.data` 和歌手自己的编号 `body.data.artistId` 收紧。未知歌手返回 `code: 200` 但没有 `data`，`data` 缺失或为 `null` 都照常返回；出现却没有 `artistId` 仍报 502。`artistName`、`alias`、头像、地区、类型、简介和 `production` 都是宽松字段，`transName` 在录制里只见过 `null`，没有声明。输入仍是 legacy，不做 id 本地校验。结构定义和类型是 `UgcArtistGetBody`，见[返回体结构](/guide/response-bodies#百科与用户贡献)。

## 补充说明

说明: 登录后调用此接口,使用此接口,传入歌手id,可获取对应的歌手简要百科信息

**必选参数：**

`id`: 歌手id

**接口地址:** `/ugc/artist/get`

**调用例子:** `/ugc/artist/get?id=15396`
