---
title: '更新歌单描述'
description: '登录后调用此接口,可以单独更新用户歌单描述'
---

# 更新歌单描述

> 登录后调用此接口,可以单独更新用户歌单描述

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/playlist/desc/update` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 是                      |
| 对应模块 | `playlist_desc_update`  |
| 文档分类 | 歌单                    |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明     |
| ------ | ------ | :--: | ------ | -------- |
| `id`   | string |  ✅  | -      | 歌单id   |
| `desc` | string |  ✅  | -      | 歌单描述 |

## HTTP 示例

```bash
GET /playlist/desc/update?id=24381616&desc=描述
```

## 编程式调用

```ts
import { playlistDescUpdate } from 'hana-music-api';

const result = await playlistDescUpdate({
  id: '24381616',
  desc: '描述',
});

console.log(result.body);
```

## 补充说明

说明 : 登录后调用此接口,可以单独更新用户歌单描述

### 请求模式

官方 web 更新歌单描述时会携带 `checkToken`。模块声明 `profile: 'web'`、`checkToken: 'optional'`，实际请求为 `https://music.163.com/weapi/playlist/desc/update`、Cookie `os=web`、浏览器 UA；传入 provider 时正文和 HTTP 头会携带令牌，不传时按网页回退路径发送。调用方传入的 `crypto`、`os`、`ua` 会被 profile 替换。令牌见[浏览器 Watchman](../../guide/watchman.md)。

```ts
import { createWatchman } from 'hana-music-api/watchman';

const watchman = await createWatchman();
await playlistDescUpdate(
  { id: '24381616', desc: '描述' },
  { checkToken: () => watchman.getToken() },
);
```

**必选参数 :**

```text
id:歌单id

desc:歌单描述

```

**接口地址 :** `/playlist/desc/update`

**调用例子 :** `/playlist/desc/update?id=24381616&desc=描述`
