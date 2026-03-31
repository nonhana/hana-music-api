---
title: "云盘上传"
description: "登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘"
---

# 云盘上传

> 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/cloud` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `cloud` |
| 文档分类 | 云盘与上传 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /cloud
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.cloud()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘

参考: https://gitlab.com/Binaryify/NeteaseCloudMusicApi/blob/main/public/cloud.html

访问地址: `/cloud.html`)

支持命令行调用,参考 module_example 目录下`song_upload.js`

**接口地址 :** `/cloud`

**调用例子 :** `/cloud`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
