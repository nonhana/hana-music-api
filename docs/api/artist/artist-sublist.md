---
title: '收藏的歌手列表'
description: '调用此接口,可获取收藏的歌手列表'
---

# 收藏的歌手列表

> 调用此接口,可获取收藏的歌手列表

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/artist/sublist` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `artist_sublist`  |
| 文档分类 | 歌手              |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 25     | 取出歌单数量 , 默认为 25                                            |
| `offset` | number \| string |  —   | -      | 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*25, 其中 25 为 limit 的值 |

## HTTP 示例

```bash
GET /artist/sublist
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.artist_sublist()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取收藏的歌手列表

**可选参数 :**

`limit`: 取出歌单数量 , 默认为 25

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*25, 其中 25 为 limit 的值

**接口地址 :** `/artist/sublist`

**调用例子 :** `/artist/sublist`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
