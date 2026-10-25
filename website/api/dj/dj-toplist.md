---
title: '电台 - 新晋电台榜/热门电台榜'
description: '登录后调用此接口，可获得新晋电台榜/热门电台榜'
---

# 电台 - 新晋电台榜/热门电台榜

> 登录后调用此接口，可获得新晋电台榜/热门电台榜

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/toplist`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_toplist`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                      |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 100    | 返回数量，默认为 100                                                      |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*100, 其中 100 为 limit 的值，默认为 0 |
| `type`   | string           |  —   | -      | 榜单类型, `new` 为新晋电台榜,`hot`为热门电台榜                            |

## HTTP 示例

```bash
GET /dj/toplist?type=hot
GET /dj/toplist?type=new&limit=1
```

## 编程式调用

```ts
import { djToplist } from 'hana-music-api';

const result = await djToplist({
  type: 'hot',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到榜单的 `body.toplist` 和榜上电台自己的编号 `toplist[].id` 收紧；`updateTime`、排名、分数、分类、封面、计数和 `dj` 主播（复用宽松的 `PlaylistUser`）都是宽松字段。`offset=99999` 越界分页返回空数组（录制 `dj_toplist.empty.json`）；非数字 `limit` 返回正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjToplistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获得新晋电台榜/热门电台榜

**可选参数 :**

`limit` : 返回数量，默认为 100

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*100, 其中 100 为 limit 的值，默认为 0

`type`: 榜单类型, `new` 为新晋电台榜,`hot`为热门电台榜

**接口地址 :** `/dj/toplist`

**调用例子 :** `/dj/toplist?type=hot` `/dj/toplist?type=new&limit=1`
