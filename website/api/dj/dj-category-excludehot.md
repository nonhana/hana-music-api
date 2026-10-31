---
title: '电台 - 非热门类型'
description: '登录后调用此接口, 可获得电台非热门类型'
---

# 电台 - 非热门类型

> 登录后调用此接口, 可获得电台非热门类型

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/dj/category/excludehot` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 是                        |
| 对应模块 | `dj_category_excludehot`  |
| 文档分类 | 电台与播客                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/category/excludehot
```

## 编程式调用

```ts
import { djCategoryExcludehot } from 'hana-music-api';

const result = await djCategoryExcludehot();

console.log(result.body);
```

## 返回内容

`body.code`、通到非热门分类列表的 `body.data` 和分类自己的编号 `data[].id` 收紧；`name` 和各尺寸封面字段是宽松字段。分类记录与 `dj_catelist` 的字段相同，但只有两个模块使用，留在模块里。本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `DjCategoryExcludehotBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口, 可获得电台非热门类型

**接口地址 :** `/dj/category/excludehot`

**调用例子 :** `/dj/category/excludehot`
