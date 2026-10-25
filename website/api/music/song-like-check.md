---
title: '歌曲是否喜爱'
description: '登录后调用此接口, 传入歌曲id, 可判断歌曲是否被喜爱;'
---

# 歌曲是否喜爱

> 登录后调用此接口, 传入歌曲id, 可判断歌曲是否被喜爱;

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/song/like/check` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `song_like_check`  |
| 文档分类 | 歌曲与播放         |

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明         |
| ----- | ------------------ | :--: | ------ | ------------ |
| `ids` | string[] \| string |  ✅  | -      | 歌曲 id 列表 |

## HTTP 示例

```bash
GET /song/like/check?ids=[2058263032,1497529942]
```

## 编程式调用

```ts
import { songLikeCheck } from 'hana-music-api';

const result = await songLikeCheck({
  ids: '[2058263032,1497529942]',
});

console.log(result.body);
```

## 返回内容

`body` 是网易云原文；`code` 和喜欢列表 `ids` 收紧。`ids` 是这个账号已喜爱的歌曲编号；传入的歌都没喜欢过时是空数组，匿名调用也返回空数组。`ids` 缺失或元素不是数字会报 502。

空 `ids` 请求会被上游以 `{ code: 400 }` 拒绝，SDK 按业务拒绝原样转交（`status: 400`）。登录对照未发现结构差异，`song_like_check.anonymous.json` 是匿名录制。结构定义和类型是 `SongLikeCheckBody`，见 [返回体结构](/guide/response-bodies#曲库)。

## 补充说明

说明 : 登录后调用此接口, 传入歌曲id, 可判断歌曲是否被喜爱;

若传入一个包含多个歌曲ID的数组, 则接口将返回一个由这些ID中被标记为喜爱的歌曲组成的数组

**必选参数 :**

`ids`: 歌曲 id 列表

**接口地址 :** `/song/like/check`

**调用例子 :** `/song/like/check?ids=[2058263032,1497529942]`
