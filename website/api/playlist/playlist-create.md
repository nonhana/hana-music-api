---
title: '新建歌单'
description: '调用此接口，传入歌单名字可新建歌单'
---

# 新建歌单

> 调用此接口，传入歌单名字可新建歌单

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/create` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `playlist_create`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数      | 类型   | 必填 | 默认值      | 说明                                                                 |
| --------- | ------ | :--: | ----------- | -------------------------------------------------------------------- |
| `name`    | string |  ✅  | -           | 歌单名                                                               |
| `privacy` | string |  —   | 否          | 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单                   |
| `type`    | string |  —   | 'NORMAL',传 | 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单 |

## HTTP 示例

```bash
GET /playlist/create?name=测试歌单
GET /playlist/create?name=test&type=VIDEO
```

## 编程式调用

```ts
import { playlistCreate } from 'hana-music-api';

const result = await playlistCreate({
  name: '测试歌单',
});

console.log(result.body);
```

## 返回内容

正文带 `code`、新歌单的 `id` 和 `playlist`。只有 `code`、`id`、`playlist`、`playlist.id` 收紧；`playlist` 里的其他字段宽松。歌单里套着的 `playlist.tracks[].id` 也宽松，缺失或类型不对只丢这个编号。结构定义和类型是 `PlaylistCreateBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入歌单名字可新建歌单

**必选参数 :** `name` : 歌单名

**可选参数 :**

`privacy` : 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单

`type` : 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单

**接口地址 :** `/playlist/create`

**调用例子 :** `/playlist/create?name=测试歌单`,`/playlist/create?name=test&type=VIDEO`
