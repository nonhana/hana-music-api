---
title: '通知 - 评论'
description: '登录后调用此接口 ,可获取评论'
---

# 通知 - 评论

> 登录后调用此接口 ,可获取评论

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/msg/comments` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `msg_comments`  |
| 文档分类 | 社交与消息      |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                        |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------- |
| `uid`    | string           |  ✅  | -      | 用户 的 id，只能和登录账号的 id 一致                        |
| `limit`  | number \| string |  —   | 30     | 返回数量 , 默认为 30                                        |
| `before` | number \| string |  —   | -      | 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据 |

## HTTP 示例

```bash
GET /msg/comments?uid=32953014
```

## 编程式调用

```ts
import { msgComments } from 'hana-music-api'

const result = await msgComments({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取评论

**必选参数 :** `uid`: 用户 的 id，只能和登录账号的 id 一致

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`before` : 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据

**接口地址 :** `/msg/comments`

**调用例子 :** `/msg/comments?uid=32953014`
