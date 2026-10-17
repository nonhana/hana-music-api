---
title: '更新歌单标签'
description: '登录后调用此接口,可以单独更新用户歌单标签'
---

# 更新歌单标签

> 登录后调用此接口,可以单独更新用户歌单标签

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/playlist/tags/update` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 是                      |
| 对应模块 | `playlist_tags_update`  |
| 文档分类 | 歌单                    |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明     |
| ------ | ------ | :--: | ------ | -------- |
| `id`   | string |  ✅  | -      | 歌单id   |
| `tags` | string |  ✅  | -      | 歌单标签 |

## HTTP 示例

```bash
GET /playlist/tags/update?id=24381616&tags=学习
```

## 编程式调用

```ts
import { playlistTagsUpdate } from 'hana-music-api';

const result = await playlistTagsUpdate({
  id: '24381616',
  tags: '学习',
});

console.log(result.body);
```

## 补充说明

说明 : 登录后调用此接口,可以单独更新用户歌单标签

模块声明 `profile: 'web'`、`checkToken: 'none'`。实际请求为 `https://music.163.com/weapi/playlist/tags/update`、Cookie `os=web`、浏览器 UA；即使调用方配置了 `checkToken`，本接口也不会取令牌或发送 `X-antiCheatToken`。调用方传入的 `crypto`、`os`、`ua` 会被 profile 替换。

**必选参数 :**

```text
id: 歌单id

tags: 歌单标签

```

**接口地址 :** `/playlist/tags/update`

**调用例子 :** `/playlist/tags/update?id=24381616&tags=学习`
