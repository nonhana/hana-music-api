---
title: '电台 - 推荐类型'
description: '登录后调用此接口, 可获得电台推荐类型'
---

# 电台 - 推荐类型

> 登录后调用此接口, 可获得电台推荐类型

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/dj/category/recommend` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 是                       |
| 对应模块 | `dj_category_recommend`  |
| 文档分类 | 电台与播客               |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/category/recommend
```

## 编程式调用

```ts
import { djCategoryRecommend } from 'hana-music-api';

const result = await djCategoryRecommend();

console.log(result.body);
```

## 返回内容

`body.code`、通到推荐分类的 `body.data`、分类自己的编号 `data[].categoryId` 和分类下的电台列表 `data[].radios` 收紧，每个电台只收紧自己的 `id`；`categoryName`、`radios[]` 里的名称、封面、计数和价格字段是宽松字段，`icon` 出现时按 `type`、`value`、`color` 宽松校验。`msg` 只见过 `null`，没有声明。本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `DjCategoryRecommendBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口, 可获得电台推荐类型

**接口地址 :** `/dj/category/recommend`

**调用例子 :** `/dj/category/recommend`
