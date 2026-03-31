---
title: '歌曲音质详情'
description: '调用此接口获取歌曲各个音质的文件信息，与 `获取歌曲详情` 接口相比，多出 `高清环绕声`、`沉浸环绕声`、`超清母带`等音质的信息'
---

# 歌曲音质详情

> 调用此接口获取歌曲各个音质的文件信息，与 `获取歌曲详情` 接口相比，多出 `高清环绕声`、`沉浸环绕声`、`超清母带`等音质的信息

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/song/music/detail` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `song_music_detail`  |
| 文档分类 | 歌曲与播放           |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /song/music/detail?id=2082700997
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_music_detail({
  id: '2082700997',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口获取歌曲各个音质的文件信息，与 `获取歌曲详情` 接口相比，多出 `高清环绕声`、`沉浸环绕声`、`超清母带`等音质的信息

**必选参数：**

`id`: 歌曲id

**接口地址:** `/song/music/detail`

**调用例子:** `/song/music/detail?id=2082700997`

返回字段说明 :

```
"br": 比特率Bit Rate,
"size": 文件大小,
"vd": Volume Delta,
"sr": 采样率Sample Rate
```

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
