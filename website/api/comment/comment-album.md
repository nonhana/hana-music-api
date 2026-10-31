---
title: '专辑评论'
description: '调用此接口，传入音乐 id 和 limit 参数，可获得该专辑的所有评论 ( 不需要'
---

# 专辑评论

> 调用此接口，传入音乐 id 和 limit 参数，可获得该专辑的所有评论 ( 不需要

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/comment/album` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `comment_album`  |
| 文档分类 | 评论             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                                  |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------------- |
| `id`     | string           |  ✅  | -      | 专辑 id                                                                               |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                                               |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值                     |
| `before` | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到) |

## HTTP 示例

```bash
GET /comment/album?id=32311
```

## 编程式调用

```ts
import { commentAlbum } from 'hana-music-api';

const result = await commentAlbum({
  id: '32311',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.comments`、`body.comments[].commentId` 收紧；`body.hotComments` 是可以没有的路径：越界分页时整个缺失，出现时 `hotComments[].commentId` 收紧。评论记录共用 `CommentRecord`，`user`、`beReplied`、`likedCount`、`time`、`decoration`、`ipLocation`、`pendantData` 等其余声明字段都宽松；`beReplied[]` 是评论里套着的回复记录，编号也宽松。`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId` 宽松。无评论专辑（录制 `comment_album.empty.json`，专辑 405204773）返回 `comments: []`、`hotComments: []`、`total: 0`；越界分页（录制 `comment_album.out-of-range.json`，`offset=100000`）返回 `comments: []` 且没有 `hotComments`。`topComments`（只见过空数组）和 `commentBanner`（只见过 `null`）没有声明，原样保留。非空录制（`comment_album.default.json`）从原 20 条 `comments`/9 条 `hotComments` 中保留覆盖各字段的非连续 5/4 条。登录对照先用 `login_status` 确认 `account.anonimousUser: false` 后抽查：非 `null` 路径与类型相同，登录响应只会在宽松字段上多出现值为 `null` 的路径（如 `comments[].user.vipRights`、`beReplied[].content`/`richContent`、`beReplied[].ipLocation.userId`），登录录制未保留。

## 补充说明

说明 : 调用此接口，传入音乐 id 和 limit 参数，可获得该专辑的所有评论 ( 不需要
登录 )

**必选参数 :** `id`: 专辑 id

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到)

**接口地址 :** `/comment/album`

**调用例子 :** `/comment/album?id=32311`
