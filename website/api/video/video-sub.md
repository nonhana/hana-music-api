---
title: '收藏视频'
description: '调用此接口,可收藏视频'
---

# 收藏视频

> 调用此接口,可收藏视频

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/video/sub`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `video_sub`    |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                    |
| ---- | ------ | :--: | ------ | ----------------------- |
| `id` | string |  ✅  | -      | 视频 id                 |
| `t`  | string |  ✅  | -      | 1 为收藏,其他为取消收藏 |

## HTTP 示例

```bash
GET /video/sub
```

## 编程式调用

```ts
import { videoSub } from 'hana-music-api';

const result = await videoSub({
  id: '123456',
  t: 'your-t',
});

console.log(result.body);
```

## 返回内容

`body.code` 是接口要拿的操作结果，收紧为 `200`；`message` 是附带的提示，宽松，`data`、`debugInfo`、`failData` 只见过 `null` 未声明。重复收藏返回 `code: 408`「已经收藏过该视频」，SDK 按业务拒绝原样转交，`status` 为 408。结构定义和类型是 `VideoSubBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可收藏视频

**必选参数 :**

`id` : 视频 id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/video/sub`

**调用例子 :** `/video/sub`
