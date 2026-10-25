---
title: '更新歌单'
description: '登录后调用此接口,可以更新用户歌单'
---

# 更新歌单

> 登录后调用此接口,可以更新用户歌单

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/update` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `playlist_update`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                        |
| ------ | ------------------ | :--: | ------ | ------------------------------------------- |
| `id`   | string             |  ✅  | -      | 歌单id                                      |
| `name` | string             |  ✅  | -      | 歌单名字                                    |
| `desc` | string             |  ✅  | -      | 歌单描述                                    |
| `tags` | string[] \| string |  ✅  | -      | 歌单tag ,多个用 `;` 隔开,只能用官方规定标签 |

## HTTP 示例

```bash
GET /playlist/update?id=24381616&name=新歌单&desc=描述&tags=欧美
```

## 编程式调用

```ts
import { playlistUpdate } from 'hana-music-api';

const result = await playlistUpdate({
  id: '24381616',
  name: '新歌单',
  desc: '描述',
  tags: '欧美',
});

console.log(result.body);
```

## 返回内容

写操作：同时更新歌单的简介、标签和名称。正文是 `/api/batch` 的多响应对象：顶层 `code` 和 `/api/playlist/desc/update`、`/api/playlist/tags/update`、`/api/playlist/update/name` 三条子路由的 `code` 收紧，子路由的结果键必须出现，`message` 宽松。子路由 `code` 可能不是 200：标签超限时 `/api/playlist/tags/update` 回 `400`，其余两条仍是 `200`，顶层 200 不代表三条都成功。已删除的歌单（`playlist.status: 10`）仍回 `200` 和三条子路由的成功码，并且仍接受名字/简介/标签写入；删除只把歌单移出用户歌单列表，元数据并未抹除，调用方不要用返回码判断歌单是否还存在。结构定义和类型是 `PlaylistUpdateBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口,可以更新用户歌单

**必选参数 :**

```text
id:歌单id

name:歌单名字

desc:歌单描述

tags:歌单tag ,多个用 `;` 隔开,只能用官方规定标签
```

**接口地址 :** `/playlist/update`

**调用例子 :** `/playlist/update?id=24381616&name=新歌单&desc=描述&tags=欧美`
