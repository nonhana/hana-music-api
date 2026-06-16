---
title: '云盘上传'
description: "登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘"
---

# 云盘上传

> 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/cloud`       |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `cloud`        |
| 文档分类 | 云盘与上传     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /cloud
```

## 编程式调用

```ts
import { cloud } from 'hana-music-api'

const result = await cloud()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘

参考: <https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/cloud.html>l>

访问地址: `/cloud.html`)

支持命令行调用,参考 module_example 目录下`song_upload.js`

**接口地址 :** `/cloud`

**调用例子 :** `/cloud`
