---
title: '获取用户歌单'
description: '登录后调用此接口，传入用户 id, 可以获取用户歌单'
---

# 获取用户歌单

> 登录后调用此接口，传入用户 id, 可以获取用户歌单

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/user/playlist` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `user_playlist`  |
| 文档分类 | 歌单             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `uid`    | string           |  ✅  | -      | 用户 id                                                                 |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /user/playlist?uid=32953014
```

## 编程式调用

```ts
import { userPlaylist } from 'hana-music-api';

const result = await userPlaylist({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.playlist` 里同时有自建的歌单和收藏的歌单，`more` 表示后面还有没有。每张歌单声明了这些字段：

| 字段                                      | 说明                                                       |
| ----------------------------------------- | ---------------------------------------------------------- |
| `id`、`name`、`coverImgUrl`、`trackCount` | 编号、名称、封面、歌曲数                                   |
| `creator.userId`、`creator.nickname`      | 创建者                                                     |
| `subscribed`                              | 收藏的歌单是 `true`，自建的是 `false`                      |
| `specialType`                             | 我喜欢的音乐是 `5`，排在第一张                             |
| `privacy`                                 | 隐私设置，原样保留网易云的数值                             |
| `updateTime`、`trackUpdateTime`           | 网易云给的两个更新时间（毫秒时间戳），可用来判断歌单变没变 |

结构定义和类型是 `UserPlaylistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，传入用户 id, 可以获取用户歌单

**必选参数 :** `uid` : 用户 id

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/user/playlist`

**调用例子 :** `/user/playlist?uid=32953014`
