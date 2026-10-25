---
title: '视频评论'
description: '调用此接口，传入音乐 id 和 limit 参数，可获得该 视频 的所有评论 ('
---

# 视频评论

> 调用此接口，传入音乐 id 和 limit 参数，可获得该 视频 的所有评论 (

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/comment/video` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `comment_video`  |
| 文档分类 | 评论             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                                  |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------------- |
| `id`     | string           |  ✅  | -      | 视频的 id                                                                             |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                                               |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值                     |
| `before` | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到) |

## HTTP 示例

```bash
GET /comment/video?id=89ADDE33C0AAE8EC14B99F6750DB954D
```

## 编程式调用

```ts
import { commentVideo } from 'hana-music-api';

const result = await commentVideo({
  id: '89ADDE33C0AAE8EC14B99F6750DB954D',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.comments`、`body.comments[].commentId` 收紧；`body.hotComments` 是可以没有的路径：越界分页时整个缺失，出现时 `hotComments[].commentId` 收紧。评论记录共用 `CommentRecord`，`user`、`beReplied`、`likedCount`、`time`、`decoration`、`ipLocation`、`pendantData` 等其余声明字段都宽松；`beReplied[]` 是评论里套着的回复记录，编号也宽松。`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId` 宽松。越界分页（录制 `comment_video.out-of-range.json`，`offset=100000`）返回 `comments: []` 且没有 `hotComments`；本批录制与探测未发现可达的无评论视频。`topComments`（只见过空数组）和 `commentBanner`（只见过 `null`）没有声明，原样保留。非空录制（`comment_video.default.json`）从原 20 条 `comments`/15 条 `hotComments` 中保留覆盖各字段的非连续 6/4 条。登录对照先用 `login_status` 确认 `account.anonimousUser: false` 后抽查：非 `null` 路径与类型相同，登录响应只会在宽松字段上多出现值为 `null` 的路径（如 `comments[].user.vipRights`、`beReplied[].content`/`richContent`、`beReplied[].ipLocation.userId`），登录录制未保留。

## 补充说明

说明 : 调用此接口，传入音乐 id 和 limit 参数，可获得该 视频 的所有评论 (
不需要登录 )

**必选参数 :** `id`: 视频的 id

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到)

**接口地址 :** `/comment/video`

**调用例子 :** `/comment/video?id=89ADDE33C0AAE8EC14B99F6750DB954D`
