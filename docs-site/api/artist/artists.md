---
title: "获取歌手单曲"
description: "调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲"
---

# 获取歌手单曲

> 调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/artists` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `artists` |
| 文档分类 | 歌手 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌手 id, 可由搜索接口获得 |

## HTTP 示例

```bash
GET /artists?id=6452
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.artists({
  id: "6452",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲

**必选参数 :** `id`: 歌手 id, 可由搜索接口获得

**接口地址 :** `/artists`

**调用例子 :** `/artists?id=6452`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
