---
title: '获取相似歌手'
description: '调用此接口，传入歌手 id, 可获得相似歌手'
---

# 获取相似歌手

> 调用此接口，传入歌手 id, 可获得相似歌手

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/simi/artist` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `simi_artist`  |
| 文档分类 | 歌手           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /simi/artist?id=6452
```

## 编程式调用

```ts
import { simiArtist } from 'hana-music-api';

const result = await simiArtist({
  id: '6452',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.artists` 和每个歌手的 `body.artists[].id` 收紧；歌手记录复用共享的 `Artist` 字段声明，`name`、`picUrl`、`albumSize`、`musicSize`、`alias` 等宽松。相似歌手记录里多出的 `alg`、`fansCount` 另声明为宽松字段，只见过 `null` 的 `identifyTag`、`isSubed`、`publishTime`、`showPrivateMsg` 没有声明，`mvSize` 按 `Artist` 的宽松声明处理。未知歌手 id 返回空数组（`simi_artist.unknown.json`）；缺少 `id` 时上游是 HTTP 200 + `code: 400`，SDK 以 `status: 400` 转交原文。本页录制来自登录账号（`context.viewer` 是 `authenticated`），没有保留匿名对照录制。

## 补充说明

说明 : 调用此接口，传入歌手 id, 可获得相似歌手

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/simi/artist`

**调用例子 :** `/simi/artist?id=6452` ( 对应和周杰伦相似歌手 )
