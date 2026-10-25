---
title: '广播电台 - 分类/地区信息'
description: '调用此接口, 获取广播电台 - 分类/地区信息'
---

# 广播电台 - 分类/地区信息

> 调用此接口, 获取广播电台 - 分类/地区信息

## 接口信息

| 项目     | 值                               |
| -------- | -------------------------------- |
| 接口地址 | `/broadcast/category/region/get` |
| 请求方式 | `GET` / `POST`                   |
| 需要登录 | 否                               |
| 对应模块 | `broadcast_category_region_get`  |
| 文档分类 | 其他工具                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /broadcast/category/region/get
```

## 编程式调用

```ts
import { broadcastCategoryRegionGet } from 'hana-music-api';

const result = await broadcastCategoryRegionGet();

console.log(result.body);
```

## 返回内容

`body.code`、通到分类和地区列表的 `body.data.categoryList`、`body.data.regionList` 以及每条分类/地区自己的编号收紧；名称宽松。这是静态目录，本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `BroadcastCategoryRegionGetBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口, 获取广播电台 - 分类/地区信息

**接口地址:** `/broadcast/category/region/get`

**调用例子:** `/broadcast/category/region/get`
