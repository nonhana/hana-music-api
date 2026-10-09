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

请求固定以 iPhone 客户端的身份发出：设备信息（`os`、`appver`、`osver`、`channel`）和 User-Agent 都用 SDK 内置的 iPhone 配置，调用方传入的 `os`、`ua` 对这个接口不起作用。请求体只带歌单 `id`。2026-10-09 实测：以 pc 设备身份发出，或带上以前写死在 SDK 里的反作弊 token 时，网易云对收藏一律返回 `405`“操作过于频繁，请稍后再试”，同一时间官方客户端操作正常；改用上述写法后，收藏和取消收藏都成功。

网易云拒绝时，SDK 原样返回它给的状态码和说明，不改写成别的错误。

::: warning 已知局限
这套写法只成功过一次收藏和一次取消。之后同一账号所有收藏请求都返回同样的 `405`，返回体里没有 `retryAfter`，过了一个多小时仍未恢复，原因还没查清。取消收藏没有在 pc 设备身份下测过，收藏自己的歌单时网易云的说明也还没录到。后续验证见 [#33](https://github.com/nonhana/hana-music-api/issues/33)。
:::

**必选参数 :**

`t` : 类型，1：收藏，其他值：取消收藏

`id` : 歌单 id

**接口地址 :** `/playlist/subscribe`

**调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`
