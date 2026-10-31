---
title: '歌手粉丝'
description: '调用此接口，传入歌手 id, 可获取歌手粉丝'
---

# 歌手粉丝

> 调用此接口，传入歌手 id, 可获取歌手粉丝

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/artist/fans` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `artist_fans`  |
| 文档分类 | 歌手           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /artist/fans?id=2116&limit=10&offset=0
```

## 编程式调用

```ts
import { artistFans } from 'hana-music-api';

const result = await artistFans({
  id: '2116',
  limit: '10',
  offset: '0',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧；粉丝列表 `body.data` 是可以没有的路径，越界分页/没有更多粉丝时上游返回 `data: null`（录制 `artist_fans.empty.json`，`offset=100000`）。出现时每个粉丝的 `userProfile` 和 `userProfile.userId` 按收紧校验，坏一条记录报 502；`vipRights` 是宽松字段。`userProfile` 的其余字段（昵称、头像、签名等）都是宽松字段，`remarkName` 这类只在录制里出现过 `null` 的字段没有声明。结构定义和类型是 `ArtistFansBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入歌手 id, 可获取歌手粉丝
**必选参数 :** `id` : 歌手 id

**接口地址 :** `/artist/fans`

**调用例子 :** `/artist/fans?id=2116&limit=10&offset=0`
