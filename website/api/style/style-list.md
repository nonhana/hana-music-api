---
title: '曲风列表'
description: '调用此接口获取曲风列表及其对应的 `tagId`'
---

# 曲风列表

> 调用此接口获取曲风列表及其对应的 `tagId`

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/style/list`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `style_list`   |
| 文档分类 | 曲风           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /style/list
```

## 编程式调用

```ts
import { styleList } from 'hana-music-api';

const result = await styleList();

console.log(result.body);
```

## 返回内容

`body.code` 和 `body.data` 收紧：`data` 是通到曲风列表的路径，每个曲风自己的编号 `data[].tagId` 也收紧。`body.data[].childrenTags` 是子曲风，嵌在宽松字段里，里面的 `tagId` 也宽松；录制里最多三层，第三层的 `childrenTags` 只见过 `null`，没有声明。`tagName`、`enName`、`level`、`picUrl`、`colorDeep`、`colorShallow`、`link`、`showText`、`tabs` 都宽松。这个接口没有参数，本批录制（28 个一级曲风）与探测未发现可达的空结果；`data` 本身允许为空数组。

## 补充说明

说明: 调用此接口获取曲风列表及其对应的 `tagId`

**接口地址:** `/style/list`

**调用例子:** `/style/list`
