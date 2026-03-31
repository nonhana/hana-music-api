---
title: '获取歌手专辑'
description: '调用此接口 , 传入歌手 id, 可获得歌手专辑内容'
---

# 获取歌手专辑

> 调用此接口 , 传入歌手 id, 可获得歌手专辑内容

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/artist/album` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `artist_album`  |
| 文档分类 | 歌手            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                           |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------ |
| `id`     | string           |  ✅  | -      | 歌手 id                                                                        |
| `limit`  | number \| string |  —   | 30     | 取出数量 , 默认为 30                                                           |
| `offset` | number \| string |  —   | <br>为 | 偏移数量 , 用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认<br>为 0 |

## HTTP 示例

```bash
GET /artist/album?id=6452&limit=5
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.artist_album({
  id: '6452',
  limit: '5',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌手 id, 可获得歌手专辑内容

**必选参数 :** `id`: 歌手 id

**可选参数 :** `limit`: 取出数量 , 默认为 30

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认
为 0

**接口地址 :** `/artist/album`

**调用例子 :** `/artist/album?id=6452&limit=5` ( 周杰伦 )

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
