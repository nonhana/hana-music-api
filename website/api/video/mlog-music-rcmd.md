---
title: '歌曲相关视频'
description: '： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。'
---

# 歌曲相关视频

> ： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/mlog/music/rcmd` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `mlog_music_rcmd`  |
| 文档分类 | 视频与 MV          |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                             |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------ |
| `songid` | string           |  ✅  | -      | 歌曲 ID                                          |
| `mvid`   | string           |  —   | -      | 如果定义，此 mvid 对应的 MV 将会作为第一个返回。 |
| `limit`  | number \| string |  —   | -      | 取出的 Mlog 数量, 不包含第一个 mvid              |

## HTTP 示例

```bash
GET /mlog/music/rcmd
```

## 编程式调用

```ts
import { mlogMusicRcmd } from 'hana-music-api';

const result = await mlogMusicRcmd({
  songid: 'your-songid',
});

console.log(result.body);
```

## 返回内容

`body.data.feeds` 是歌曲相关视频列表，每条记录自己的 `id` 按字符串收紧；`resource` 是附带的 mlog 记录，整体宽松（嵌套歌曲复用 `MlogSong`），声明 `mlogBaseData.userId`/`coverDetail`/`video`/`mixInfo.status`、`userProfile` 的昵称/编号/头像和 `source` 等有证据的字段；`video` 里声明 `urlInfo`/`rcmdUrlInfo`/`urlInfos`（`id`、`r`、`size`、`validityTime`、`resolution`）；`matchField`、`sameCity`、`type`、`more` 和 `message` 宽松，`data.msg` 只见过 `null`，没有声明。声明了这些字段，其余原样保留（如 `urlInfo.url`、`relatedPubUsers`、`mlogPlaylists`）。结构定义和类型是 `MlogMusicRcmdBody`，见 [返回体结构](/guide/response-bodies)。录制覆盖有相关视频（1 条）和没有相关视频（`feeds: []`）两种情况。

## 补充说明

说明： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。

请注意：此接口偶尔会在相关视频后返回不相关视频，请合理使用。

**必选参数 :** `songid` : 歌曲 ID

**可选参数 :** `mvid` : 如果定义，此 mvid 对应的 MV 将会作为第一个返回。
`limit` : 取出的 Mlog 数量, 不包含第一个 mvid

**接口地址 :** `/mlog/music/rcmd`
