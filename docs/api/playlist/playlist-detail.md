---
title: "获取歌单详情"
description: "歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可"
---

# 获取歌单详情

> 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/detail` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_detail` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌单 id |
| `s` | string | — | 8 | 歌单最近的 s 个收藏者,默认为 8 |

## HTTP 示例

```bash
GET /playlist/detail?id=24381616
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_detail({
  id: "24381616",
})

console.log(result.body)
```

## 补充说明

说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可
以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，但是返回的 trackIds 是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 `song/detail` 接口获取所有歌曲的详情 ([https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452))

**必选参数 :** `id` : 歌单 id

**可选参数 :** `s` : 歌单最近的 s 个收藏者,默认为 8

**接口地址 :** `/playlist/detail`

**调用例子 :** `/playlist/detail?id=24381616`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
