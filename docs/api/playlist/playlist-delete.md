---
title: '删除歌单'
description: '调用此接口 , 传入歌单 id 可删除歌单'
---

# 删除歌单

> 调用此接口 , 传入歌单 id 可删除歌单

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/delete` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `playlist_delete`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                      |
| ---- | ------------------ | :--: | ------ | ------------------------- |
| `id` | string[] \| string |  ✅  | -      | 歌单 id,可多个,用逗号隔开 |

## HTTP 示例

```bash
GET /playlist/delete?id=2947311456
GET /playlist/delete?id=5013464397,5013427772
```

## 编程式调用

```ts
import { playlistDelete } from 'hana-music-api'

const result = await playlistDelete({
  id: '2947311456',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌单 id 可删除歌单

**必选参数 :** `id` : 歌单 id,可多个,用逗号隔开

**接口地址 :** `/playlist/delete`

**调用例子 :** `/playlist/delete?id=2947311456` , `/playlist/delete?id=5013464397,5013427772`
