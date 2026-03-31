---
title: '本地歌曲文件匹配网易云歌曲信息'
description: '调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息'
---

# 本地歌曲文件匹配网易云歌曲信息

> 调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/search/match` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `search_match`  |
| 文档分类 | 搜索            |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /search/match?title=富士山下&album=&artist=陈奕迅&duration=259.21&md5=bd708d006912a09d827f02e754cf8e56
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.search_match({
  title: '富士山下',
  album: '',
  artist: '陈奕迅',
  duration: '259.21',
  md5: 'bd708d006912a09d827f02e754cf8e56',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息

**必选参数：**

`title`: 文件的标题信息，是文件属性里的标题属性，并非文件名

`album`: 文件的专辑信息

`artist`: 文件的艺术家信息

`duration`: 文件的时长，单位为秒

`md5`: 文件的md5

**接口地址:** `/search/match`

**调用例子:** `/search/match?title=富士山下&album=&artist=陈奕迅&duration=259.21&md5=bd708d006912a09d827f02e754cf8e56`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
