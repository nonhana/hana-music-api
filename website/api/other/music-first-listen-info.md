---
title: '回忆坐标'
description: '可以获取当前歌曲的回忆坐标信息 (见手机 APP 百科页的回忆坐标功能)'
---

# 回忆坐标

> 可以获取当前歌曲的回忆坐标信息 (见手机 APP 百科页的回忆坐标功能)

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/music/first/listen/info` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 否                         |
| 对应模块 | `music_first_listen_info`  |
| 文档分类 | 其他工具                   |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /music/first/listen/info
```

## 编程式调用

```ts
import { musicFirstListenInfo } from 'hana-music-api';

const result = await musicFirstListenInfo();

console.log(result.body);
```

## 返回内容

`body.code`、`body.data`、`data.songInfoDto.songId` 和 `data.musicFirstListenDto.date` 收紧；`songInfoDto`、`musicFirstListenDto`、`musicTotalPlayDto`、`musicLikeSongDto` 按可以没有处理：匿名调用 `data` 是空对象，出现时里面的收紧字段仍会校验。`title`、`musicPlayMostDto`、`musicMinoritySongDto`、`musicCommentDto`、`musicFrequentListenDto` 只见过 `null`，未声明并原样保留。缺少歌曲 `id` 时上游 HTTP 400 空正文被归一成 `status: 200`、`body: ''`，结构定义保留这个空字符串分支。结构定义和类型是 `MusicFirstListenInfoBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 可以获取当前歌曲的回忆坐标信息 (见手机 APP 百科页的回忆坐标功能)

**接口地址:** `/music/first/listen/info`

**必选参数：** `id` : 歌曲 ID
