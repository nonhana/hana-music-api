---
title: '获取 mlog 播放地址'
description: '调用此接口，传入 mlog id, 可获取 mlog 播放地址'
---

<!-- cSpell:ignore OVPTWKS -->

# 获取 mlog 播放地址

> 调用此接口，传入 mlog id, 可获取 mlog 播放地址

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mlog/url`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mlog_url`     |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数  | 类型             | 必填 | 默认值 | 说明                |
| ----- | ---------------- | :--: | ------ | ------------------- |
| `id`  | string           |  ✅  | -      | mlog id             |
| `res` | number \| string |  —   | 1080   | 分辨率，默认为 1080 |

## HTTP 示例

```bash
GET /mlog/url?id=a1qOVPTWKS1ZrK8
```

## 编程式调用

```ts
import { mlogUrl } from 'hana-music-api';

const result = await mlogUrl({
  id: 'a1qOVPTWKS1ZrK8',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到 mlog 记录的 `body.data`、mlog 自己的编号 `data.id`/`data.resource.id`、通到播放地址的必填链路 `data.resource.content`、`...content.video`、`...video.urlInfo` 和播放地址 `data.resource.content.video.urlInfo.url` 收紧；`content`、`video`、`urlInfo` 缺任意一段都会报 502（无视频 mlog 没有成功体证据）。`content`、`video` 的其余展示字段、歌曲记录（复用 `MlogSong` 的字段并补 `startTime`、`endTime`、`isLiked`、宽松 `privilege`）和作者宽松。播放地址带 `wsSecret`/`wsTime` 签名，会随时间变化，不要缓存或逐字比较；`urlInfos[]` 是同一视频的其他清晰度，只有当前 `res` 选中的 `urlInfo` 收紧。`businessEntrance`、`promotion`、`relatedActivity`、`showExtInfo`、`otherData`、`nextModule`、`srcId`、`logInfo` 只见过 `null`，没有声明，仍原样保留。结构定义和类型是 `MlogUrlBody`，见 [返回体结构](/guide/response-bodies)。录制覆盖视频 mlog 和分享歌曲的 mlog；非法 id 返回 `code: 400`。

## 补充说明

说明 : 调用此接口，传入 mlog id, 可获取 mlog 播放地址

**必选参数 :** `id` : mlog id

**可选参数 :** `res`: 分辨率，默认为 1080

**接口地址 :** `/mlog/url`

**调用例子 :** `/mlog/url?id=a1qOVPTWKS1ZrK8`
