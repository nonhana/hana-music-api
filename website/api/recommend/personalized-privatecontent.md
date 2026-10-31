---
title: '独家放送(入口列表)'
description: '调用此接口，可获取独家放送'
---

# 独家放送(入口列表)

> 调用此接口，可获取独家放送

## 接口信息

| 项目     | 值                             |
| -------- | ------------------------------ |
| 接口地址 | `/personalized/privatecontent` |
| 请求方式 | `GET` / `POST`                 |
| 需要登录 | 否                             |
| 对应模块 | `personalized_privatecontent`  |
| 文档分类 | 推荐与发现                     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /personalized/privatecontent
```

## 编程式调用

```ts
import { personalizedPrivatecontent } from 'hana-music-api';

const result = await personalizedPrivatecontent();

console.log(result.body);
```

## 返回内容

`body.code`、独家放送列表 `body.result` 和每条内容自己的编号 `result[].id` 收紧；`name` 和条目的 `alg`、`copywriter`、`picUrl`、`sPicUrl`、`url`、`type` 宽松。匿名和登录录制都是 3 条且字段集相同；这个接口没有分页参数，没有可达的空结果，数组本身允许为空。

## 补充说明

说明 : 调用此接口，可获取独家放送

**接口地址 :** `/personalized/privatecontent`

**调用例子 :** `/personalized/privatecontent`
