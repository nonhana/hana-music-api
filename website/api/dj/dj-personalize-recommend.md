---
title: '电台个性推荐'
description: '调用此接口,可获取电台个性推荐列表'
---

# 电台个性推荐

> 调用此接口,可获取电台个性推荐列表

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/dj/personalize/recommend` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `dj_personalize_recommend`  |
| 文档分类 | 电台与播客                  |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                              |
| ------- | ---------------- | :--: | ------ | --------------------------------- |
| `limit` | number \| string |  —   | 6      | 返回数量,默认为 6,总条数最多 6 条 |

## HTTP 示例

```bash
GET /dj/personalize/recommend?limit=5
```

## 编程式调用

```ts
import { djPersonalizeRecommend } from 'hana-music-api';

const result = await djPersonalizeRecommend({
  limit: '5',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到个性推荐电台的 `body.data` 和每个电台自己的编号 `data[].id` 收紧；主播复用 `ProgramDj`（`PlaylistUser` 加 `brand`），`descPicList`、`discountPrice`、`icon`、`immersionAnimation`、`immersionCover`、`liveInfo`、`manualTagsDTO`、`replaceResource`、`scoreInfoDTO`、`shortName`、`videos` 在本批录制里只见过 `null`，`participateUidList` 只见过空数组，都没有声明。`limit` 由 SDK 默认 `6` 后再请求（`limit=0` 也走默认），本批录制与探测未发现可达的空结果，`data` 数组本身允许为空。

## 补充说明

说明 : 调用此接口,可获取电台个性推荐列表
**可选参数 :**

`limit` : 返回数量,默认为 6,总条数最多 6 条

**接口地址 :** `/dj/personalize/recommend`

**调用例子 :** `/dj/personalize/recommend?limit=5`
