---
title: '曲风详情'
description: '调用此接口可以获取该曲风的描述信息'
---

# 曲风详情

> 调用此接口可以获取该曲风的描述信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/style/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `style_detail`  |
| 文档分类 | 曲风            |

## 请求参数

| 参数    | 类型   | 必填 | 默认值 | 说明    |
| ------- | ------ | :--: | ------ | ------- |
| `tagId` | string |  ✅  | -      | 曲风 ID |

## HTTP 示例

```bash
GET /style/detail?tagId=1000
```

## 编程式调用

```ts
import { styleDetail } from 'hana-music-api';

const result = await styleDetail({
  tagId: '1000',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧；`body.data` 可以没有：未知曲风 id 时上游返回 `data: null`（录制 `style_detail.unknown-tag.json`），缺失或 `null` 都照常返回；出现时曲风自己的编号 `data.tagId` 收紧。`name`、`level`、`parentNames`、`enName`、`desc`、`cover`、`colorDeep`、`colorShallow`、`songNum`、`artistNum`、`tabs` 宽松；`professionalReviews`、`favouriteSong`、`tagPortrait` 是登录后才有的偏好内容，匿名时都是 `null`（录制 `style_detail.anonymous.json`），按宽松字段处理；`playRate` 在录制里只见过 `null`，没有声明。`favouriteSong.favouriteSong` 复用歌曲结构，宽松容器里的歌曲编号也宽松。

## 补充说明

说明: 调用此接口可以获取该曲风的描述信息

**接口地址:** `/style/detail`

**必选参数:** `tagId`: 曲风 ID

**调用例子:** `/style/detail?tagId=1000`
