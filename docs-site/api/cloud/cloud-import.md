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

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /cloud/import?song=最伟大的作品&artist=周杰伦&album=最伟大的作品&fileType=flac&fileSize=50412168&bitrate=1652&md5=d02b8ab79d91c01167ba31e349fe5275
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.cloud_import({
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

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
