---
title: "心动模式/智能播放"
description: "登录后调用此接口 , 可获取心动模式/智能播放列表"
---

# 心动模式/智能播放

> 登录后调用此接口 , 可获取心动模式/智能播放列表

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playmode/intelligence/list` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `playmode_intelligence_list` |
| 文档分类 | 推荐与发现 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌曲 id |
| `pid` | string | ✅ | - | 歌单 id |
| `sid` | string | — | - | 要开始播放的歌曲的 id |

## HTTP 示例

```bash
GET /playmode/intelligence/list?id=33894312&pid=24381616
GET /playmode/intelligence/list?id=33894312&pid=24381616&sid=36871368
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playmode_intelligence_list({
  id: "33894312",
  pid: "24381616",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可获取心动模式/智能播放列表
**必选参数 :** `id` : 歌曲 id

`pid` : 歌单 id

**可选参数 :**
`sid` : 要开始播放的歌曲的 id

**接口地址 :** `/playmode/intelligence/list`

**调用例子 :** `/playmode/intelligence/list?id=33894312&pid=24381616` , `/playmode/intelligence/list?id=33894312&pid=24381616&sid=36871368`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
