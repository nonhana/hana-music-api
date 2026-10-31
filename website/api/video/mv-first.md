---
title: '最新 mv'
description: '调用此接口，可获取最新 mv'
---

# 最新 mv

> 调用此接口，可获取最新 mv

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/first`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_first`     |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                                    |
| ------ | ------ | :--: | ------ | ------------------------------------------------------- |
| `area` | string |  —   | -      | 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部 |

## HTTP 示例

```bash
GET /mv/first?limit=10
```

## 编程式调用

```ts
import { mvFirst } from 'hana-music-api';

const result = await mvFirst({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code`、MV 列表 `body.data` 和每个 MV 的编号 `data[].id` 收紧（共用 `MvSummary`）；记录里的封面、简介、播放数、时长、收藏状态、`artists`、`alias`、`transNames` 都是宽松字段。筛选不到 MV 时 `data` 是空数组（录制 `mv_first.empty-area.json`）。结构定义和类型是 `MvFirstBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取最新 mv

**可选参数 :** `area`: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部

**可选参数 :** `limit`: 取出数量，默认为 30

**接口地址 :** `/mv/first`

**调用例子 :** `/mv/first?limit=10`
