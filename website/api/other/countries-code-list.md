---
title: '国家编码列表'
description: '调用此接口,可获取国家编码列表'
---

# 国家编码列表

> 调用此接口,可获取国家编码列表

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/countries/code/list` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `countries_code_list`  |
| 文档分类 | 其他工具               |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /countries/code/list
```

## 编程式调用

```ts
import { countriesCodeList } from 'hana-music-api';

const result = await countriesCodeList();

console.log(result.body);
```

## 返回内容

国家分组在 `data`，每组有 `label` 和 `countryList`，每个国家记录用 `code`（国际区号）、`zh`、`en`、`locale`。`code`、`data`、`data[].countryList` 和 `countryList[].code` 收紧；分组名和语言名宽松。国家列表是固定数据，本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `CountriesCodeListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取国家编码列表

**接口地址 :** `/countries/code/list`
