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

### 请求模式

| 请求                                      | 实际请求                                                                                                                                | 适用场景                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 收藏 `t=1`，未传 `checkToken`             | weapi，`https://music.163.com/weapi/playlist/subscribe`，Cookie `os=web`，浏览器 UA，正文只带 `id`                                      | 低频调用；连续操作仍可能被上游 405 拒绝           |
| 收藏 `t=1`，传入 `checkToken`             | weapi，`https://music.163.com/weapi/playlist/subscribe`，Cookie `os=web`，浏览器 UA，正文 `id`/`checkToken`，HTTP 头 `X-antiCheatToken` | 需要稳定高频收藏；令牌必须由调用方从稳定设备现取  |
| 取消收藏 `t=0`，无论是否配置 `checkToken` | weapi，`https://music.163.com/weapi/playlist/unsubscribe`，Cookie `os=web`，浏览器 UA，正文只带 `id`                                    | 实测可用的取消路径；不取令牌、不发送 `checkToken` |

```ts
const checkToken = await getFreshCheckToken(); // 170 字符，易盾 Watchman 现取
await playlistSubscribe({ t: '1', id: '106697785' }, { checkToken });
```

`checkToken` 只影响收藏（`t=1`）。传函数时，SDK 在每次收藏前调用一次；取消收藏始终走 weapi 网页写法，不取令牌，也不发送 `checkToken`。收藏时 SDK 使用 `web` profile（weapi + `os=web` + 浏览器 UA），调用方传入的 `crypto`、`os`、`ua` 会被替换；token 由请求层按协议放置，模块不自己拼位置。SDK 不生成、不缓存、不重放令牌。profile 规则见[请求 profile](../../guide/request-profiles.md)，浏览器取令牌见[浏览器 Watchman](../../guide/watchman.md)。

::: warning 令牌与设备
令牌必须来自**稳定的设备/会话**。2026-10-18 02:05（CST）抓取官方现代 web player：`/weapi/playlist/subscribe` 返回 200，HTTP 头 `X-antiCheatToken` 为 170 字符；`/weapi/playlist/unsubscribe` 返回 200 且不带该头。它的 JS 用 `initWatchman({ productNumber: 'YD00000558929251' })` 初始化，每次收藏前调用 `window.WM.getToken`，把 `checkToken` 放进正文并加 `X-antiCheatToken`。

02:08 在真实客户端 origin `https://campanula-test.caelum.moe/` 里用官方 Watchman 现取令牌，公开 SDK 的 weapi 收藏成功（HTTP 200 / `{ code: 200 }`，列表 54 → 55），取消后恢复 54/36；02:09 用同一个 Watchman 实例连续 3 轮、轮间隔 5 秒，收藏/取消全部 200，每轮恢复 54/36。此前用新的无头设备取令牌会连续 405，因此不要每次新建设备。

不要写死令牌、复用到多个请求，或每次新建设备；这些做法会被上游拒绝。`checkToken` 只用于 SDK/程序化调用；HTTP 服务会拒绝这个执行配置。
:::

### 已知限制

- 不传 `checkToken` 时，网页/API 路径在连续操作后会进入数小时拒绝窗口；此时 405 与请求写法无关，等待时间不由 SDK 决定。SDK 原样保留上游状态码和说明，不对写操作自动重试；`retryAfter`（默认 30 秒）只是退避建议，不是网易云承诺的恢复时间。
- 传 `checkToken` 时，稳定性取决于调用方提供的令牌是否来自稳定设备；SDK 不对令牌有效性作保证，也不尝试绕过上游反作弊。
- 收藏和取消都走 weapi；如果网页路径也被上游限频，仍可能返回 405。取消不带 token 是官方现代 web player 的行为。
- 收藏自己的歌单会收到 HTTP 200 / `{ code: 401, message: '歌单创建者已设置隐私' }`，SDK 保留原正文；不把其他错误改写成“操作过于频繁”。

调查过程和原始对照见[深入调查](../../guide/playlist-subscription-research.md#check-token-continuation)。

**必选参数 :**

`t` : 类型，1：收藏，其他值：取消收藏

`id` : 歌单 id

**接口地址 :** `/playlist/subscribe`

**调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`
