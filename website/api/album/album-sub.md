---
title: '收藏/取消收藏专辑'
description: '调用此接口,可收藏/取消收藏专辑'
---

# 收藏/取消收藏专辑

> 调用此接口,可收藏/取消收藏专辑

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/album/sub`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `album_sub`    |
| 文档分类 | 专辑           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                    |
| ---- | ------ | :--: | ------ | ----------------------- |
| `id` | string |  ✅  | -      | 专辑 id                 |
| `t`  | string |  ✅  | -      | 1 为收藏,其他为取消收藏 |

## HTTP 示例

```bash
GET /album/sub?t=1
GET /album/sub?t=0
```

## 编程式调用

```ts
import { albumSub } from 'hana-music-api';

const result = await albumSub({
  t: '1',
});

console.log(result.body);
```

## 补充说明

说明 : 调用此接口,可收藏/取消收藏专辑

**必选参数 :**

`id` : 专辑 id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/album/sub`

**调用例子 :** `/album/sub?t=1` `/album/sub?t=0`

## SDK 调用与身份

程序化调用 `albumSub({ id, t }, { cookie, checkToken })`，收藏与取消均可选择提供字符串或异步 provider；未配置就不取值、不附加。provider 按 API 请求取新值，失败或为空时在发送前拒绝，等待取值计入总期限。普通 HTTP 接口不接受 checkToken 执行配置。

收藏和取消分别发送到 `https://music.163.com/weapi/album/sub`、`https://music.163.com/weapi/album/unsub`，使用浏览器 UA、Cookie `os=web`，保留本次登录会话。协议、域名、UA 和受控 Cookie 不接受普通配置覆盖；桌面的 appver/channel/osver 等字段会移除。旧版本虽已使用 weapi，但默认 Cookie 仍含 PC 字段，这次身份调整会改变实际请求。

显式 token 同时放入加密正文 checkToken 和 HTTP 头 X-antiCheatToken。写请求不缓存、不合并、不自动重试，上游业务拒绝保留原意。编码通过不保证上游接受任意 token；当前 web 身份的真实账号兼容与恢复需单独验证，历史响应录制不能代替当次验证。统一规则见 [执行配置](/guide/config-reference)。
