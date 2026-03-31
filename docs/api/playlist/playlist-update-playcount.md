---
title: "歌单更新播放量"
description: "调用后可更新歌单播放量"
---

# 歌单更新播放量

> 调用后可更新歌单播放量

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/update/playcount` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_update_playcount` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌单 id |

## HTTP 示例

```bash
GET /playlist/update/playcount?id=24381616
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_update_playcount({
  id: "24381616",
})

console.log(result.body)
```

## 补充说明

说明 : 调用后可更新歌单播放量

**必选参数 :** `id` : 歌单 id

**接口地址 :** `/playlist/update/playcount`

**调用例子 :** `/playlist/update/playcount?id=24381616`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
