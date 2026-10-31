---
title: '获取视频分类列表'
description: '调用此接口，可获取视频分类列表'
---

# 获取视频分类列表

> 调用此接口，可获取视频分类列表

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/video/category/list` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `video_category_list`  |
| 文档分类 | 视频与 MV              |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /video/category/list
```

## 编程式调用

```ts
import { videoCategoryList } from 'hana-music-api';

const result = await videoCategoryList();

console.log(result.body);
```

## 返回内容

`body.code`、分类列表 `body.data` 和每条分类自己的编号 `data[].id` 收紧；`name`、`url`、`relatedVideoType`、`selectTab` 宽松，`abExtInfo` 只见过 `null` 没有声明，原样保留。本批录制与探测没有发现可达的空结果（`offset` 越界仍返回同样的分类）。结构定义和类型是 `VideoCategoryListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取视频分类列表

**接口地址 :** `/video/category/list`

**调用例子 :** `/video/category/list`
