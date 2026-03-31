---
title: "歌曲评论"
description: "调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该音乐的所有评论 ( 不需要登录 )"
---

# 歌曲评论

> 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该音乐的所有评论 ( 不需要登录 )

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/comment/music` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `comment_music` |
| 文档分类 | 评论 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 音乐 id |
| `limit` | number \| string | — | 20 | 取出评论数量 , 默认为 20 |
| `offset` | number \| string | — | - | 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值 |
| `before` | number \| string | — | - | 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到) |

## HTTP 示例

```bash
GET /comment/music?id=186016&limit=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.comment_music({
  id: "186016",
  limit: "1",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该音乐的所有评论 ( 不需要登录 )

**必选参数 :** `id`: 音乐 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到)

**接口地址 :** `/comment/music`

**调用例子 :** `/comment/music?id=186016&limit=1` 对应晴天评论

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
