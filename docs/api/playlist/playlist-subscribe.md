---
title: '收藏/取消收藏歌单'
description: '调用此接口，传入类型和歌单 id 可收藏歌单或者取消收藏歌单'
---

# 收藏/取消收藏歌单

> 调用此接口，传入类型和歌单 id 可收藏歌单或者取消收藏歌单

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/playlist/subscribe` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `playlist_subscribe`  |
| 文档分类 | 歌单                  |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                            |
| ---- | ------ | :--: | ------ | ------------------------------- |
| `t`  | string |  ✅  | -      | 类型，1：收藏，其他值：取消收藏 |
| `id` | string |  ✅  | -      | 歌单 id                         |

## HTTP 示例

```bash
GET /playlist/subscribe?t=1&id=106697785
GET /playlist/subscribe?t=2&id=106697785
```

## 编程式调用

```ts
import { playlistSubscribe } from 'hana-music-api';

const result = await playlistSubscribe({
  t: '1',
  id: '106697785',
});

console.log(result.body);
```

## 补充说明

说明 : 调用此接口，传入类型和歌单 id 可收藏歌单或者取消收藏歌单

请求固定以 iPhone 客户端的设备身份发出，不带反作弊 token。2026-10-09 实测：以 pc 设备身份发出，或带上 SDK 内置的反作弊 token 时，网易云对收藏、取消收藏一律返回 `405`“操作过于频繁，请稍后再试”，同一时间官方客户端操作正常。

网易云拒绝时，SDK 原样返回它给的状态码和说明，不改写成别的错误。短时间内反复收藏、取消，也会收到同样的 `405`，返回体里没有 `retryAfter`。

**必选参数 :**

`t` : 类型，1：收藏，其他值：取消收藏

`id` : 歌单 id

**接口地址 :** `/playlist/subscribe`

**调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`
