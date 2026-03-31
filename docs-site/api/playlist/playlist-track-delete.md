---
title: "删除视频歌单里的视频"
description: "调用此接口 , 可删除视频歌单里的视频 ( 需要登录 )"
---

# 删除视频歌单里的视频

> 调用此接口 , 可删除视频歌单里的视频 ( 需要登录 )

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/track/delete` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `playlist_track_delete` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `pid` | string | ✅ | - | 歌单 id |
| `ids` | string[] \| string | ✅ | - | 视频 id,支持多个,用`,`隔开 |

## HTTP 示例

```bash
GET /playlist/track/delete?pid=5271999357&ids=186041
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_track_delete({
  pid: "5271999357",
  ids: "186041",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可删除视频歌单里的视频 ( 需要登录 )
**必选参数 :**

`pid` : 歌单 id

`ids` : 视频 id,支持多个,用`,`隔开

**接口地址 :** `/playlist/track/delete`

**调用例子 :** `/playlist/track/delete?pid=5271999357&ids=186041`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
