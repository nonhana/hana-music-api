---
title: '获取歌手 mv'
description: '调用此接口，传入歌手 id, 可获得歌手 mv 信息，具体 mv 播放地址可调'
---

# 获取歌手 mv

> 调用此接口，传入歌手 id, 可获得歌手 mv 信息，具体 mv 播放地址可调

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/artist/mv`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `artist_mv`    |
| 文档分类 | 歌手           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                      |
| ---- | ------ | :--: | ------ | ------------------------- |
| `id` | string |  ✅  | -      | 歌手 id, 可由搜索接口获得 |

## HTTP 示例

```bash
GET /artist/mv?id=6452
```

## 编程式调用

```ts
import { artistMv } from 'hana-music-api'

const result = await artistMv({
  id: '6452',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，传入歌手 id, 可获得歌手 mv 信息，具体 mv 播放地址可调
用`/mv`传入此接口获得的 mvid 来拿到，如 :
`/artist/mv?id=6452`,`/mv?mvid=5461064`

**必选参数 :** `id`: 歌手 id, 可由搜索接口获得

**接口地址 :** `/artist/mv`

**调用例子 :** `/artist/mv?id=6452`
