---
title: '电台 - 推荐'
description: '登录后调用此接口，可获得推荐电台'
---

# 电台 - 推荐

> 登录后调用此接口，可获得推荐电台

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/dj/recommend` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `dj_recommend`  |
| 文档分类 | 电台与播客      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/recommend
```

## 编程式调用

```ts
import { djRecommend } from 'hana-music-api';

const result = await djRecommend();

console.log(result.body);
```

## 返回内容

`body.code`、通到精选电台列表的 `body.djRadios` 和每个电台的编号 `djRadios[].id` 收紧；`name`、电台名称、封面、分类、计数、`copywriter`、`buyed` 和 `dj` 主播（复用宽松的 `PlaylistUser`）都是宽松字段。这个接口没有分页，本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `DjRecommendBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获得推荐电台

**接口地址 :** `/dj/recommend`

**调用例子 :** `/dj/recommend`
