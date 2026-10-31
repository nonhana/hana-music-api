---
title: '电台 - 分类'
description: '登录后调用此接口，可获得电台类型'
---

# 电台 - 分类

> 登录后调用此接口，可获得电台类型

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/catelist` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_catelist`  |
| 文档分类 | 电台与播客     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/catelist
```

## 编程式调用

```ts
import { djCatelist } from 'hana-music-api';

const result = await djCatelist();

console.log(result.body);
```

## 返回内容

`body.code`、通到分类列表的 `body.categories` 和分类自己的编号 `categories[].id` 收紧；`name` 和各尺寸封面字段是宽松字段。分类记录与 `dj_category_excludehot` 的字段相同，但只有两个模块使用，按“三个模块才进共享结构”的规则留在模块里。本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `DjCatelistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获得电台类型

**接口地址 :** `/dj/catelist`

**调用例子 :** `/dj/catelist`
