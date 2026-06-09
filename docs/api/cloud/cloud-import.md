---
title: '云盘导入歌曲'
description: '登录后调用此接口,使用此接口,可云盘导入歌曲而无需上传文件'
---

# 云盘导入歌曲

> 登录后调用此接口,使用此接口,可云盘导入歌曲而无需上传文件

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/cloud/import` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `cloud_import`  |
| 文档分类 | 云盘与上传      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /cloud/import?song=最伟大的作品&artist=周杰伦&album=最伟大的作品&fileType=flac&fileSize=50412168&bitrate=1652&md5=d02b8ab79d91c01167ba31e349fe5275
```

## 编程式调用

```ts
import { cloudImport } from 'hana-music-api'

const result = await cloudImport({
  song: '最伟大的作品',
  artist: '周杰伦',
  album: '最伟大的作品',
  fileType: 'flac',
  fileSize: '50412168',
  bitrate: '1652',
  md5: 'd02b8ab79d91c01167ba31e349fe5275',
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,可云盘导入歌曲而无需上传文件

以下情况可导入成功

1.文件已经有用户上传至云盘

2.文件是网易云音乐自己的音源

**必选参数：**

`song`: 歌名/文件名

`fileType`: 文件后缀

`fileSize`: 文件大小

`bitrate`: 文件比特率

`md5`: 文件MD5

**可选参数：**

`id`: 歌曲ID,情况2时必须正确填写

`artist`: 歌手 默认为未知

`album`: 专辑 默认为未知

**接口地址:** `/cloud/import`

**调用例子:** `/cloud/import?song=最伟大的作品&artist=周杰伦&album=最伟大的作品&fileType=flac&fileSize=50412168&bitrate=1652&md5=d02b8ab79d91c01167ba31e349fe5275`

为保证成功,请使用 `获取音乐url` 接口获取各文件属性

其中比特率`bitrate`要进行以下转换

```
bitrate = Math.floor(br / 1000)
```

导入后的文件名后缀均为 `.mp3` 。但用 `获取音乐url` 获取到的文件格式仍然是正确的。
