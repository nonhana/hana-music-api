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
import { ugcArtistSearch } from 'hana-music-api';

const result = await ugcArtistSearch({
  keyword: 'sasakure',
});

console.log(result.body);
```

## 返回内容

`body.code`、搜索结果 `body.data`、结果列表 `body.data.list` 和每条结果自己的编号 `body.data.list[].artistId` 收紧。关键字搜索、以歌手 id 作为关键字和无结果三种情况里 `list` 都是数组，无结果时是空数组；`totalCount` 和 `msg` 宽松，`extraCount` 只见过空对象，没有声明，原样保留。输入仍是 legacy，关键字不做本地校验。结构定义和类型是 `UgcArtistSearchBody`，见[返回体结构](/guide/response-bodies#百科与用户贡献)。

## 补充说明

说明: 登录后调用此接口,使用此接口,传入歌手名关键字或者歌手id,可获取搜索到的歌手信息

**必选参数：**

`keyword`: 关键字或歌手id

**可选参数：**

`limit`: 取出条目数量，默认为 40

**接口地址:** `/ugc/artist/search`

**调用例子:** `/ugc/artist/search?keyword=sasakure`
