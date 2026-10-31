---
title: '评论抱一抱列表'
description: '调用此接口,可获取评论抱一抱列表'
---

# 评论抱一抱列表

> 调用此接口,可获取评论抱一抱列表

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/comment/hug/list` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `comment_hug_list`  |
| 文档分类 | 评论                |

## 请求参数

| 参数       | 类型             | 必填 | 默认值            | 说明                                        |
| ---------- | ---------------- | :--: | ----------------- | ------------------------------------------- |
| `uid`      | string           |  ✅  | -                 | 用户 id                                     |
| `cid`      | string           |  ✅  | -                 | 评论 id                                     |
| `sid`      | string           |  ✅  | -                 | 资源 id                                     |
| `page`     | number \| string |  —   | -                 | 页数                                        |
| `cursor`   | number \| string |  —   | -1,第一页不需要传 | 上一页返回的 cursor,默认-1,第一页不需要传   |
| `idCursor` | string           |  —   | -1,第一页不需要传 | 上一页返回的 idCursor,默认-1,第一页不需要传 |
| `pageSize` | number \| string |  —   | 100               | 每页页数,默认 100                           |

## HTTP 示例

```bash
GET /comment/hug/list?uid=285516405&cid=1167145843&sid=863481066&pageSize=2&page=1
```

## 编程式调用

```ts
import { commentHugList } from 'hana-music-api';

const result = await commentHugList({
  uid: '285516405',
  cid: '1167145843',
  sid: '863481066',
  pageSize: '2',
  page: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data.hugComments` 收紧；每条抱一抱记录的 `hugContent`、`user` 宽松。`data.currentComment` 是被抱评论的附带信息，`commentId` 等编号一并放开，v2 多出的 `threadId`、`replyCount`、`showFloorComment`、`extInfo`、`commentVideoVO` 等按宽松记录声明。没有抱一抱时 `data.hugComments` 是空数组：录制 `comment_hug_list.empty.json`（评论 9673055460）返回 `hugComments: []`、`hugTotalCounts: 0` 并保留 `currentComment`；非空录制 `comment_hug_list.default.json`（歌曲 2092595510 评论 7431461934）保留 3 条抱一抱记录。`hasMore`、`cursor`、`idCursor`、`hugTotalCounts` 宽松；`currentComment.tag`、`bottomTags` 等只见过空容器或 `null` 的字段没有声明，原样保留。登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。

## 补充说明

说明 : 调用此接口,可获取评论抱一抱列表

**必选参数 :**

`uid`: 用户 id

`cid`: 评论 id

`sid`: 资源 id

**可选参数 :**

`page`: 页数

`cursor`: 上一页返回的 cursor,默认-1,第一页不需要传

`idCursor`: 上一页返回的 idCursor,默认-1,第一页不需要传

`pageSize` : 每页页数,默认 100

**接口地址 :** `/comment/hug/list`

**调用例子 :** `/comment/hug/list?uid=285516405&cid=1167145843&sid=863481066&pageSize=2&page=1`
