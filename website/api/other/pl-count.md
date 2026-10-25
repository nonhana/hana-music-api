---
title: '私信和通知接口'
description: '登录后调用此接口,可获取私信和通知数量信息'
---

# 私信和通知接口

> 登录后调用此接口,可获取私信和通知数量信息

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/pl/count`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `pl_count`     |
| 文档分类 | 其他工具       |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /pl/count
```

## 编程式调用

```ts
import { plCount } from 'hana-music-api';

const result = await plCount();

console.log(result.body);
```

## 返回内容

正文是私信、通知、关注等计数（`msg`、`notice`、`follow`、`forward`、`comment`、`totalComment`、`newProgramCount` 等）。只有 `code` 收紧，计数以及 `friend`、`eventUser`、`sceneComments`、`battle` 里的字段全部宽松；未登录时 `pushMsg` 是 `null`、`eventUser` 整个缺失。结构定义和类型是 `PlCountBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口,可获取私信和通知数量信息

**接口地址 :** `/pl/count`

**调用例子 :** `/pl/count`
