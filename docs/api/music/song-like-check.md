---
title: "歌曲是否喜爱"
description: "登录后调用此接口, 传入歌曲id, 可判断歌曲是否被喜爱;"
---

# 歌曲是否喜爱

> 登录后调用此接口, 传入歌曲id, 可判断歌曲是否被喜爱;

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/song/like/check` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `song_like_check` |
| 文档分类 | 歌曲与播放 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `ids` | string[] \| string | ✅ | - | 歌曲 id 列表 |

## HTTP 示例

```bash
GET /song/like/check?ids=[2058263032,1497529942]
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_like_check({
  ids: "[2058263032,1497529942]",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 传入歌曲id, 可判断歌曲是否被喜爱;

若传入一个包含多个歌曲ID的数组, 则接口将返回一个由这些ID中被标记为喜爱的歌曲组成的数组

**必选参数 :**  

`ids`: 歌曲 id 列表

**接口地址 :** `/song/like/check`

**调用例子 :** `/song/like/check?ids=[2058263032,1497529942]`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
