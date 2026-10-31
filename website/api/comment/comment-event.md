---
title: '获取动态评论'
description: '登录后调用此接口，可以获取动态下评论'
---

# 获取动态评论

> 登录后调用此接口，可以获取动态下评论

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/comment/event` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `comment_event`  |
| 文档分类 | 评论             |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明                                             |
| ---------- | ------ | :--: | ------ | ------------------------------------------------ |
| `threadId` | string |  ✅  | -      | 动态 id，可通过 `/event`，`/user/event` 接口获取 |

## HTTP 示例

```bash
GET /comment/event?threadId=A_EV_2_6559519868_32953014
```

## 编程式调用

```ts
import { commentEvent } from 'hana-music-api';

const result = await commentEvent({
  threadId: 'A_EV_2_6559519868_32953014',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.comments`、`body.comments[].commentId` 收紧；`body.hotComments` 是可以没有的路径：越界分页时整个缺失，出现时 `hotComments[].commentId` 收紧。评论记录复用 `CommentRecord`，其余声明字段宽松。零评论动态（录制 `comment_event.empty.json`，`A_EV_2_38014023821_17062533682`）返回空的 `comments`、`hotComments`；越界分页（录制 `comment_event.out-of-range.json`，`offset=100000`）返回 `comments: []` 且没有 `hotComments`。非空录制 `comment_event.default.json`（动态 `A_EV_2_37730695660_17062533682`）保留 2 条评论。`topComments` 只见过空数组、`commentBanner` 只见过 `null`，没有声明，原样保留。登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。

## 补充说明

说明 : 登录后调用此接口，可以获取动态下评论

**必选参数 :** `threadId` : 动态 id，可通过 `/event`，`/user/event` 接口获取

**接口地址 :** `/comment/event`

**调用例子 :** `/comment/event?threadId=A_EV_2_6559519868_32953014`
