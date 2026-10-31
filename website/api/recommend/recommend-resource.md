---
title: '获取每日推荐歌单'
description: '调用此接口，可获得每日推荐歌单 ( 需要登录 )'
---

# 获取每日推荐歌单

> 调用此接口，可获得每日推荐歌单 ( 需要登录 )

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/recommend/resource` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `recommend_resource`  |
| 文档分类 | 推荐与发现            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /recommend/resource
```

## 编程式调用

```ts
import { recommendResource } from 'hana-music-api';

const result = await recommendResource();

console.log(result.body);
```

## 返回内容

`body.code`、每日推荐歌单列表 `body.recommend` 和每个歌单自己的编号 `recommend[].id` 收紧；歌单摘要复用 `PlaylistSummary`，`featureFirst`、`haveRcmdSongs` 和卡片附加字段（`copywriter`、`picUrl`、小写 `playcount` 等）宽松。录制覆盖匿名（6 条）和登录（19 条）两种视角，字段路径相同，`creator.expertTags` 匿名 6/6 是 `null`、登录 19 条中 14 条仍 `null`、5 条是非空数组；没有可达的空结果，数组本身允许为空。

## 补充说明

说明 : 调用此接口，可获得每日推荐歌单 ( 需要登录 )

**接口地址 :** `/recommend/resource`

**调用例子 :** `/recommend/resource`
