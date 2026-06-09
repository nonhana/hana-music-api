---
title: '搜索歌手'
description: '登录后调用此接口,使用此接口,传入歌手名关键字或者歌手id,可获取搜索到的歌手信息'
---

# 搜索歌手

> 登录后调用此接口,使用此接口,传入歌手名关键字或者歌手id,可获取搜索到的歌手信息

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/ugc/artist/search` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 是                   |
| 对应模块 | `ugc_artist_search`  |
| 文档分类 | 百科与用户贡献       |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /ugc/artist/search?keyword=sasakure
```

## 编程式调用

```ts
import { ugcArtistSearch } from 'hana-music-api'

const result = await ugcArtistSearch({
  keyword: 'sasakure',
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,传入歌手名关键字或者歌手id,可获取搜索到的歌手信息

**必选参数：**

`keyword`: 关键字或歌手id

**可选参数：**

`limit`: 取出条目数量 , 默认为 40

**接口地址:** `/ugc/artist/search`

**调用例子:** `/ugc/artist/search?keyword=sasakure`
