---
title: '获取视频标签/分类下的视频'
description: '调用此接口，传入标签/分类`id`,可获取到相关的视频,分页参数只能传入 offset'
---

# 获取视频标签/分类下的视频

> 调用此接口，传入标签/分类`id`,可获取到相关的视频,分页参数只能传入 offset

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/video/group` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `video_group`  |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明             |
| -------- | ---------------- | :--: | ------ | ---------------- |
| `id`     | string           |  ✅  | -      | videoGroup 的 id |
| `offset` | number \| string |  —   | 0      | 默认 0           |

## HTTP 示例

```bash
GET /video/group?id=9104
```

## 编程式调用

```ts
import { videoGroup } from 'hana-music-api';

const result = await videoGroup({
  id: '9104',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧；`hasmore`、`rcmdLimit` 宽松。分组视频列表 `datas` 在本批录制和对全部标签 id 的探测里没有出现过非 `null` 值，元素类型无法确定，没有声明，原样保留；`msg` 只见过 `null`，也未声明，原样保留。结构定义和类型是 `VideoGroupBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入标签/分类`id`,可获取到相关的视频,分页参数只能传入 offset

**必选参数 :** `id`: videoGroup 的 id

**可选参数 :** `offset`: 默认 0

**接口地址 :** `/video/group`

**调用例子 :** `/video/group?id=9104`
