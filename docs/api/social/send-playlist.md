---
title: '发送私信(带歌单)'
description: '登录后调用此接口 , 传入用户 id 和要发送的信息和歌单 id, 可以发送带歌单的私信(注:不能发送重复的歌单)'
---

# 发送私信(带歌单)

> 登录后调用此接口 , 传入用户 id 和要发送的信息和歌单 id, 可以发送带歌单的私信(注:不能发送重复的歌单)

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/send/playlist` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `send_playlist`  |
| 文档分类 | 社交与消息       |

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                     |
| ---------- | ------------------ | :--: | ------ | ------------------------ |
| `user_ids` | string[] \| string |  ✅  | -      | 用户 id,多个需用逗号隔开 |
| `msg`      | string             |  ✅  | -      | 要发送的信息             |

## HTTP 示例

```bash
GET /send/playlist?msg=test&user_ids=475625142&playlist=705123491
GET /send/playlist?msg=test2&user_ids=475625142,32953014&playlist=705123493
```

## 编程式调用

```ts
import { sendPlaylist } from 'hana-music-api'

const result = await sendPlaylist({
  msg: 'test',
  user_ids: '475625142',
  playlist: '705123491',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息和歌单 id, 可以发送带歌单的私信(注:不能发送重复的歌单)

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`msg` : 要发送的信息

**接口地址 :** `/send/playlist`

**调用例子 :** `/send/playlist?msg=test&user_ids=475625142&playlist=705123491`,`/send/playlist?msg=test2&user_ids=475625142,32953014&playlist=705123493`
