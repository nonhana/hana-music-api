---
title: '数字专辑销量'
description: '调用此接口，传入专辑 id, 可获取数字专辑销量'
---

# 数字专辑销量

> 调用此接口，传入专辑 id, 可获取数字专辑销量

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/digitalAlbum/sales` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `digitalAlbum_sales`  |
| 文档分类 | 专辑                  |

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明                        |
| ----- | ------------------ | :--: | ------ | --------------------------- |
| `ids` | string[] \| string |  ✅  | -      | 专辑 id, 支持多个,用`,`隔开 |

## HTTP 示例

```bash
GET /digitalAlbum/sales?ids=120605500
GET /digitalAlbum/sales?ids=120605500,125080528
```

## 编程式调用

```ts
import { digitalAlbumSales } from 'hana-music-api';

const result = await digitalAlbumSales({
  ids: '120605500',
});

console.log(result.body);
```

## 返回内容

`body.code` 和销量映射 `body.data` 收紧；`data` 的键是专辑 id，值是数字销量。未知专辑 id 仍返回 `code: 200`，映射里对应值是 `0`（录制 `digital-album/digitalAlbum_sales.unknown.json`）；缺 `ids` 返回 `code: 400`（`msg`/`massage` 都是 `参数错误`，录制 `digital-album/digitalAlbum_sales.missing-ids.json`），空 `ids` 返回 `code: 500`（`销量查询失败`，录制 `digital-album/digitalAlbum_sales.empty.json`），SDK 都按业务拒绝原样转交。结构定义和类型是 `DigitalAlbumSalesBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入专辑 id, 可获取数字专辑销量

**必选参数 :** `ids` : 专辑 id, 支持多个,用`,`隔开

**接口地址 :** `/digitalAlbum/sales`

**调用例子 :** `/digitalAlbum/sales?ids=120605500` `/digitalAlbum/sales?ids=120605500,125080528`
