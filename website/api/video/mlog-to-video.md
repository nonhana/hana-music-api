---
title: '将 mlog id 转为视频 id'
description: '调用此接口，传入 mlog id, 可获取 video id，然后通过`video/url` 获取播放地址'
---

<!-- cSpell:ignore OVPTWKS -->

# 将 mlog id 转为视频 id

> 调用此接口，传入 mlog id, 可获取 video id，然后通过`video/url` 获取播放地址

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/mlog/to/video` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `mlog_to_video`  |
| 文档分类 | 视频与 MV        |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | mlog id |

## HTTP 示例

```bash
GET /mlog/to/video?id=a1qOVPTWKS1ZrK8
```

## 编程式调用

```ts
import { mlogToVideo } from 'hana-music-api';

const result = await mlogToVideo({
  id: 'a1qOVPTWKS1ZrK8',
});

console.log(result.body);
```

## 返回内容

`body.code` 和接口要拿的视频 id `body.data`（32 位十六进制字符串）收紧，`message` 宽松。结构定义和类型是 `MlogToVideoBody`，见 [返回体结构](/guide/response-bodies)。视频 mlog 和分享歌曲的 mlog 都能转换；非法 id 返回 `code: 400`、`msg: mlog无对应video`，按业务拒绝原样转交。

## 补充说明

说明 : 调用此接口，传入 mlog id, 可获取 video id，然后通过`video/url` 获取播放地址

**必选参数 :** `id` : mlog id

**接口地址 :** `/mlog/to/video`

**调用例子 :** `/mlog/to/video?id=a1qOVPTWKS1ZrK8`
