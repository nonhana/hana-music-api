---
title: '音乐百科 - 简要信息'
description: '调用此接口可以获取歌曲的音乐百科简要信息'
---

# 音乐百科 - 简要信息

> 调用此接口可以获取歌曲的音乐百科简要信息

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/song/wiki/summary` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `song_wiki_summary`  |
| 文档分类 | 歌曲与播放           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 ID |

## HTTP 示例

```bash
GET /song/wiki/summary?id=1958384591
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_wiki_summary({
  id: '1958384591',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取歌曲的音乐百科简要信息

由于此接口返回内容过于复杂, 请按需取用

**接口地址:** `/song/wiki/summary`

**必选参数:** `id`: 歌曲 ID

**调用例子:** `/song/wiki/summary?id=1958384591`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
