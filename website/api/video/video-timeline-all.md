---
title: '获取全部视频列表'
description: '调用此接口,可获取视频分类列表,分页参数只能传入 offset'
---

# 获取全部视频列表

> 调用此接口,可获取视频分类列表,分页参数只能传入 offset

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/video/timeline/all` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `video_timeline_all`  |
| 文档分类 | 视频与 MV             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明   |
| -------- | ---------------- | :--: | ------ | ------ |
| `offset` | number \| string |  —   | 0      | 默认 0 |

## HTTP 示例

```bash
GET /video/timeline/all
```

## 编程式调用

```ts
import { videoTimelineAll } from 'hana-music-api';

const result = await videoTimelineAll();

console.log(result.body);
```

## 返回内容

`body.code`、视频列表 `body.datas` 和每条视频的编号 `datas[].data.vid` 收紧；`creator` 复用宽松的 `PlaylistUser`，`resolutions[]`、`videoGroup[]`、`markTypes`、`relateSong[]`（宽松字段里套着的歌曲记录）和其他详情字段宽松。`extAlg`、`relatedInfo`、`urlInfo`、`videoUserLiveInfo` 只见过 `null`，没有声明。越界 `offset` 返回 `datas: []`、`hasmore: false`（录制 `video_timeline_all.empty.json`），空数组是正常结果。登录录制（`video_timeline_all.authenticated.json`）的差异只在宽松字段：`relateSong` 出现歌曲记录、`markTypes` 从 `null` 变成 `[110]`；`creator.experts` 的键集合差异也只在这个模块出现——匿名录制里有 `{1,2}`，登录只有 `{1}` 或 `null`。结构定义和类型是 `VideoTimelineAllBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取视频分类列表,分页参数只能传入 offset

**可选参数 :** `offset`: 默认 0

**接口地址 :** `/video/timeline/all`

**调用例子 :** `/video/timeline/all`
