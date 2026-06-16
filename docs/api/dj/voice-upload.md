---
title: '播客上传声音'
description: '可以上传声音到播客'
---

# 播客上传声音

> 可以上传声音到播客

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/voice/upload` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `voice_upload`  |
| 文档分类 | 电台与播客      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voice/upload
```

## 编程式调用

```ts
import { voiceUpload } from 'hana-music-api'

const result = await voiceUpload()

console.log(result.body)
```

## 补充说明

说明: 可以上传声音到播客。

**接口地址:** `/voice/upload`

**必选参数：**
`voiceListId`: 播客 id

`coverImgId`: 播客封面

`categoryId`: 分类id

`secondCategoryId`:次级分类id

`description`: 声音介绍

**可选参数：**
`songName`: 声音名称

`privacy`: 设为隐私声音,播客如果是隐私博客,则必须设为1

`publishTime`:默认立即发布,定时发布的话需传入时间戳

`autoPublish`: 是否发布动态,是则传入1

`autoPublishText`: 动态文案

`orderNo`: 排序,默认为1

`composedSongs`: 包含歌曲(歌曲id),多个用逗号隔开
