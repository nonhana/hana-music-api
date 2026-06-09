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
import { musicFirstListenInfo } from 'hana-music-api'

const result = await musicFirstListenInfo()

console.log(result.body)
```

## 补充说明

说明: 可以获取当前歌曲的回忆坐标信息 (见手机 APP 百科页的回忆坐标功能)

**接口地址:** `/music/first/listen/info`

**必选参数：** `id` : 歌曲 ID
