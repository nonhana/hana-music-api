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

请求固定以 iPhone 客户端的身份发出：设备信息（`os`、`appver`、`osver`、`channel`）和 User-Agent 都用 SDK 内置的 iPhone 配置，调用方传入的 `os`、`ua` 对这个接口不起作用。业务请求体只带歌单 `id`。

2026-10-17 本机真账号验证：公开 SDK 的 `client.playlistSubscribe` 收藏、取消收藏各成功一次，均返回 `{ code: 200 }`。关闭缓存读取歌单列表，确认目标出现后又消失，收藏数为 35 → 36 → 35，账号歌单列表恢复原状。

同次验证中，收藏自己的临时歌单返回 HTTP 200、`{ code: 401, message: '歌单创建者已设置隐私' }`，SDK 以 `status: 401` 拒绝，正文保持不变。临时歌单创建时使用默认 `privacy=0`，验证后已删除；这是该账号本次实测的返回，不能据此推断所有自建歌单都会返回相同说明。

PC 对照使用 eapi、官方 Mac 3.1.13 的 User-Agent 模板、`os=pc`、`appver=3.1.13`，业务请求体也只有 `id`，仍返回 `code: 405`。失败后停止，没有重试或继续测试 PC 取消收藏。这只说明该组合本次未通过；官方 Mac 客户端实际使用的 `os` 尚未确认，因此继续保留已通过验证的 iPhone 身份。完整时间与参数见 [#33](https://github.com/nonhana/hana-music-api/issues/33)。

网易云拒绝时，SDK 保留业务返回码和说明，不将其他错误改写成“操作过于频繁”。遇到 `405` 等限流返回时会补充 `retryAfter`（上游未给出时默认 30 秒），供调用方安排稍后重试，不代表网易云保证在该时间后恢复。

**必选参数 :**

`t` : 类型，1：收藏，其他值：取消收藏

`id` : 歌单 id

**接口地址 :** `/playlist/subscribe`

**调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`
