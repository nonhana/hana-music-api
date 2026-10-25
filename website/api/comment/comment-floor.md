---
title: '楼层评论'
description: '调用此接口，传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论'
---

# 楼层评论

> 调用此接口，传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/comment/floor` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `comment_floor`  |
| 文档分类 | 评论             |

## 请求参数

| 参数              | 类型             | 必填 | 默认值 | 说明                                                                                                                                                       |
| ----------------- | ---------------- | :--: | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentCommentId` | string           |  ✅  | -      | 楼层评论 id                                                                                                                                                |
| `id`              | string           |  ✅  | -      | 资源 id                                                                                                                                                    |
| `type`            | string           |  ✅  | -      | 数字，资源类型，对应歌曲，mv, 专辑，歌单，电台, 视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |
| `limit`           | number \| string |  —   | 20     | 取出评论数量，默认为 20                                                                                                                                    |
| `time`            | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据                                                                                                          |

## HTTP 示例

```bash
GET /comment/floor?parentCommentId=1438569889&id=29764564&type=0
```

## 编程式调用

```ts
import { commentFloor } from 'hana-music-api';

const result = await commentFloor({
  parentCommentId: '1438569889',
  id: '29764564',
  type: '0',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data.comments`、`body.data.comments[].commentId` 收紧；每条楼层回复复用 `CommentRecord`。`body.data.ownerComment` 是父评论的附带信息，编号也宽松（`LooseCommentRecord`），出现时按宽松记录校验。没有楼层时 `data.comments` 是空数组：录制 `comment_floor.empty.json`（父评论 9673055460）返回 `comments: []` 并保留 `ownerComment`；有回复的录制 `comment_floor.default.json`（歌曲 2092595510，父评论 7431461934）保留覆盖各字段的非连续 6 条楼层回复（原 20 条，`context.truncated.length` 记原长度）。`message`、`hasMore`、`totalCount`、`time` 宽松；`bestComments` 只见过空数组、`currentComment` 只见过 `null`，没有声明，原样保留。登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。

## 补充说明

说明 : 调用此接口，传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论

**必选参数 :**  
`parentCommentId`: 楼层评论 id

`id` : 资源 id

`type`: 数字，资源类型，对应歌曲，mv, 专辑，歌单，电台, 视频对应以下类型

```text
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台节目

5: 视频

6: 动态

7: 电台
```

**可选参数 :** `limit`: 取出评论数量，默认为 20

`time`: 分页参数,取上一页最后一项的 `time` 获取下一页数据

**接口地址 :** `/comment/floor`

**调用例子 :** `/comment/floor?parentCommentId=1438569889&id=29764564&type=0`
