---
title: '收藏视频到视频歌单'
description: '调用此接口，可收藏视频到视频歌单 ( 需要登录 )'
---

# 收藏视频到视频歌单

> 调用此接口，可收藏视频到视频歌单 ( 需要登录 )

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/playlist/track/add` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `playlist_track_add`  |
| 文档分类 | 歌单                  |

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明                       |
| ----- | ------------------ | :--: | ------ | -------------------------- |
| `pid` | string             |  ✅  | -      | 歌单 id                    |
| `ids` | string[] \| string |  ✅  | -      | 视频 id,支持多个,用`,`隔开 |

## HTTP 示例

```bash
GET /playlist/track/add?pid=5271999357&ids=186041
```

## 编程式调用

```ts
import { playlistTrackAdd } from 'hana-music-api';

const result = await playlistTrackAdd({
  pid: '5271999357',
  ids: '186041',
});

console.log(result.body);
```

## 返回内容

写操作：把 `ids` 里的歌曲加到 `pid` 指定的歌单，成功会改变这个歌单的曲目。正文只承诺返回码，结构定义只收紧 `code`；成功正文没有录到，其余字段原样保留。缺少 `pid` 时上游回 `code: 400`（请求参数错误）；这个 400 以前被归一成 `status: 200` 放行，现在按业务拒绝转交 `status: 400` 和原始正文。上游对自有的临时歌单也可能回 `code: 401`（无权限操作歌单），对已删除的歌单回 `404`，这两个状态不变。结构定义和类型是 `PlaylistTrackAddBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可收藏视频到视频歌单 ( 需要登录 )

**必选参数 :**

`pid` : 歌单 id

`ids` : 视频 id,支持多个,用`,`隔开

**接口地址 :** `/playlist/track/add`

**调用例子 :** `/playlist/track/add?pid=5271999357&ids=186041`
