---
title: '歌曲红心数量'
description: '调用此接口获取歌曲的红心用户数量'
---

# 歌曲红心数量

> 调用此接口获取歌曲的红心用户数量

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/song/red/count` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `song_red_count`  |
| 文档分类 | 歌曲与播放        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /song/red/count?id=186016
```

## 编程式调用

```ts
import { songRedCount } from 'hana-music-api';

const result = await songRedCount({
  id: '186016',
});

console.log(result.body);
```

## 返回内容

`body` 是网易云原文；`code`、数量路径 `data` 和 `data.count` 收紧。`data.count` 是红心数量，不存在的歌曲返回 `0`；`countDesc` 只是展示文案，宽松（缺失、`null` 或类型不对都只丢这一项）。

匿名调用也会返回数量，登录和匿名的结构相同。结构定义和类型是 `SongRedCountBody`，见 [返回体结构](/guide/response-bodies#曲库)。

## 补充说明

说明: 调用此接口获取歌曲的红心用户数量

**必选参数：**

`id`: 歌曲id

**接口地址:** `/song/red/count`

**调用例子:** `/song/red/count?id=186016`
