---
title: '云贝推歌历史记录'
description: '登录后调用此接口，可以获得云贝推歌历史记录'
---

# 云贝推歌历史记录

> 登录后调用此接口，可以获得云贝推歌历史记录

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/yunbei/rcmd/song/history` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 是                          |
| 对应模块 | `yunbei_rcmd_song_history`  |
| 文档分类 | 会员与云贝                  |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                            |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------- |
| `size`   | number \| string |  —   | 20     | 返回数量，默认为 20                                                            |
| `cursor` | number \| string |  —   | ''     | 返回数据的 cursor, 默认为 ''，传入上一次返回结果的 cursor,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /yunbei/rcmd/song/history?size=10
```

## 编程式调用

```ts
import { yunbeiRcmdSongHistory } from 'hana-music-api'

const result = await yunbeiRcmdSongHistory({
  size: '10',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口，可以获得云贝推歌历史记录

**可选参数 :** `size` : 返回数量，默认为 20

`cursor` : 返回数据的 cursor, 默认为 ''，传入上一次返回结果的 cursor,将会返回下一页的数据

**接口地址 :** `/yunbei/rcmd/song/history`

**调用例子 :** `/yunbei/rcmd/song/history?size=10`
