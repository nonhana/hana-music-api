---
title: '歌单收藏者'
description: '调用此接口，传入歌单 id 可获取歌单的所有收藏者'
---

# 歌单收藏者

> 调用此接口，传入歌单 id 可获取歌单的所有收藏者

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/playlist/subscribers` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `playlist_subscribers`  |
| 文档分类 | 歌单                    |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                              |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------- |
| `id`     | string           |  ✅  | -      | 歌单 id                                                           |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                           |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值 |

## HTTP 示例

```bash
GET /playlist/subscribers?id=544215255&limit=30
```

## 编程式调用

```ts
import { playlistSubscribers } from 'hana-music-api';

const result = await playlistSubscribers({
  id: '544215255',
  limit: '30',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.subscribers` 和每个收藏者自己的编号 `subscribers[].userId` 收紧；其余收藏者字段沿用 `PlaylistUser` 的宽松写法（`avatarDetail`、`experts` 在收藏者录制里只见过 `null`，仍保留在共享结构里），`subscribeTime` 是模块内补的宽松字段；`total`、`more`、`reason` 宽松。匿名视角的 `total` 上限是 30：`offset=0` 返回 20 条（`more: true`），`offset=20` 仍返回 10 条，但带 `reason: needLogin`、`more: false`；`offset=40/60/100` 返回空数组、`total: 0` 和 `reason: needLogin`。登录后 `total` 是完整数量（同歌单 2000，录制 `playlist_subscribers.authenticated-page-one.json`）；登录 `offset=100000` 返回空数组和 `total: 0`（`playlist_subscribers.empty.json`）。非 null 路径与类型相同；登录只在宽松字段上多出现 null 或不同值（`total` 等）。结构定义和类型是 `PlaylistSubscribersBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入歌单 id 可获取歌单的所有收藏者  
**必选参数 :**

`id` : 歌单 id

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值

**接口地址 :** `/playlist/subscribers`

**调用例子 :** `/playlist/subscribers?id=544215255&limit=30`
