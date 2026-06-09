---
title: '私人 DJ'
description: '调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)'
---

# 私人 DJ

> 调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/aidj/content/rcmd` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `aidj_content_rcmd`  |
| 文档分类 | 推荐与发现           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /aidj/content/rcmd
```

## 编程式调用

```ts
import { aidjContentRcmd } from 'hana-music-api'

const result = await aidjContentRcmd()

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)

**接口地址:** `/aidj/content/rcmd`

**可选参数：** `longitude` `latitude` : 当前的经纬度
