---
title: '视频详情'
description: '调用此接口，可获取视频详情'
---

# 视频详情

> 调用此接口，可获取视频详情

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/video/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `video_detail`  |
| 文档分类 | 视频与 MV       |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明       |
| ---- | ------ | :--: | ------ | ---------- |
| `id` | string |  ✅  | -      | 视频 的 id |

## HTTP 示例

```bash
GET /video/detail?id=89ADDE33C0AAE8EC14B99F6750DB954D
```

## 编程式调用

```ts
import { videoDetail } from 'hana-music-api';

const result = await videoDetail({
  id: '89ADDE33C0AAE8EC14B99F6750DB954D',
});

console.log(result.body);
```

## 返回内容

`body.code`、详情 `body.data` 和视频自己的编号 `data.vid` 收紧；`creator` 复用宽松的 `PlaylistUser`，封面、标题、描述、评论/分享/收藏计数、时长、发布时间、`resolutions[]`、`videoGroup[]` 等其余字段宽松。`markTypes` 只见过空数组、`videoUserLiveInfo` 只见过 `null`，没有声明，原样保留。数字视频 id 会返回 `code: 400`，作为业务失败原样转交；本批录制与探测未发现可达的空结果。结构定义和类型是 `VideoDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取视频详情

**必选参数 :** `id`: 视频 的 id

**接口地址 :** `/video/detail`

**调用例子 :** `/video/detail?id=89ADDE33C0AAE8EC14B99F6750DB954D`
