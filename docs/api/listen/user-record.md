---
title: '获取用户播放记录'
description: '登录后调用此接口 , 传入用户 id, 可获取用户播放记录'
---

# 获取用户播放记录

> 登录后调用此接口 , 传入用户 id, 可获取用户播放记录

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/record` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_record`  |
| 文档分类 | 听歌记录       |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                            |
| ------ | ------ | :--: | ------ | ----------------------------------------------- |
| `uid`  | string |  ✅  | -      | 用户 id                                         |
| `type` | string |  —   | -      | type=1 时只返回 weekData, type=0 时返回 allData |

## HTTP 示例

```bash
GET /user/record?uid=32953014&type=1
```

## 编程式调用

```ts
import { userRecord } from 'hana-music-api'

const result = await userRecord({
  uid: '32953014',
  type: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id, 可获取用户播放记录

**必选参数 :** `uid` : 用户 id

**可选参数 :** `type` : type=1 时只返回 weekData, type=0 时返回 allData

**接口地址 :** `/user/record`

**调用例子 :** `/user/record?uid=32953014&type=1`
