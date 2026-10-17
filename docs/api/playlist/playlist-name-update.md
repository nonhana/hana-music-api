---
title: '更新歌单名'
description: '登录后调用此接口,可以单独更新用户歌单名'
---

# 更新歌单名

> 登录后调用此接口,可以单独更新用户歌单名

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/playlist/update/name` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 是                      |
| 对应模块 | `playlist_name_update`  |
| 文档分类 | 歌单                    |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明   |
| ------ | ------ | :--: | ------ | ------ |
| `id`   | string |  ✅  | -      | 歌单id |
| `name` | string |  ✅  | -      | 歌单名 |

## HTTP 示例

```bash
GET /playlist/name/update?id=24381616&name=歌单名
```

## 编程式调用

```ts
import { playlistNameUpdate } from 'hana-music-api';

const result = await playlistNameUpdate({
  id: '24381616',
  name: '歌单名',
});

console.log(result.body);
```

## 补充说明

说明 : 登录后调用此接口,可以单独更新用户歌单名

模块声明 `profile: 'web'`、`checkToken: 'none'`。实际请求为 `https://music.163.com/weapi/playlist/update/name`、Cookie `os=web`、浏览器 UA；即使调用方配置了 `checkToken`，本接口也不会取令牌或发送 `X-antiCheatToken`。调用方传入的 `crypto`、`os`、`ua` 会被 profile 替换。

**必选参数 :**

```text
id: 歌单id

name: 歌单名

```

**接口地址 :** `/playlist/update/name`

**调用例子 :** `/playlist/update/name?id=24381616&name=歌单名`
