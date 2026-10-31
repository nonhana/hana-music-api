---
title: '热门歌手'
description: '调用此接口，可获取热门歌手数据'
---

# 热门歌手

> 调用此接口，可获取热门歌手数据

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/top/artists` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `top_artists`  |
| 文档分类 | 歌手           |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                        |
| -------- | ---------------- | :--: | ------ | --------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 50     | 取出数量，默认为 50                                                         |
| `offset` | number \| string |  —   | <br>为 | 偏移数量，用于分页，如：(页数 - 1)\*50, 其中 50 为 limit 的值，默认<br>为 0 |

## HTTP 示例

```bash
GET /top/artists?offset=0&limit=30
```

## 编程式调用

```ts
import { topArtists } from 'hana-music-api';

const result = await topArtists({
  offset: '0',
  limit: '30',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.artists` 和每个歌手的 `id` 收紧。歌手记录沿用 `Artist` 的宽松字段，在模块内局部收紧了 `id`，并声明了宽松的 `fansCount`；`more` 也是宽松字段。录制里只出现过 `null` 的字段（如 `alg`、`identifyTag`、`isSubed`、`showPrivateMsg`）没有声明，原样保留。分页越过总数时返回真实的空结果：`artists: []`、`more: false`。结构定义和类型是 `TopArtistsBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取热门歌手数据

**可选参数 :** `limit`: 取出数量，默认为 50

`offset`: 偏移数量，用于分页，如：(页数 - 1)\*50, 其中 50 为 limit 的值，默认
为 0

**接口地址 :** `/top/artists`

**调用例子 :** `/top/artists?offset=0&limit=30`
