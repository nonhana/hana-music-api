---
title: '获取视频播放地址'
description: '调用此接口，传入视频 id,可获取视频播放地址'
---

# 获取视频播放地址

> 调用此接口，传入视频 id,可获取视频播放地址

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/video/url`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `video_url`    |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明       |
| ---- | ------ | :--: | ------ | ---------- |
| `id` | string |  ✅  | -      | 视频 的 id |

## HTTP 示例

```bash
GET /video/url?id=89ADDE33C0AAE8EC14B99F6750DB954D
```

## 编程式调用

```ts
import { videoUrl } from 'hana-music-api';

const result = await videoUrl({
  id: '89ADDE33C0AAE8EC14B99F6750DB954D',
});

console.log(result.body);
```

## 返回内容

`body.code`、地址列表 `body.urls`、条目里的视频编号 `urls[].id` 和地址 `urls[].url` 收紧；`r`、`size`、`validityTime`、`needPay` 宽松，`payInfo` 只见过 `null` 没有声明。录制覆盖请求 1080 实际给到 720（`video_url.default.json`）、480p（`video_url.480p.json`）和 240p（`video_url.240p.json`）；未知视频返回 `urls: []`（`video_url.empty.json`），本批未探测到 `url` 为 `null`。付费/会员视频的 `urls[].url` 未覆盖；若上游给 `null`，会以 `UnexpectedUpstreamShape`（`status: 502`）拒绝。结构定义和类型是 `VideoUrlBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入视频 id,可获取视频播放地址

**必选参数 :** `id`: 视频 的 id

**接口地址 :** `/video/url`

**调用例子 :** `/video/url?id=89ADDE33C0AAE8EC14B99F6750DB954D`
