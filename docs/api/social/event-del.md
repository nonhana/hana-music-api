---
title: '删除用户动态'
description: '登录后调用此接口 ,可以删除用户动态'
---

# 删除用户动态

> 登录后调用此接口 ,可以删除用户动态

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/event/del`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `event_del`    |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明    |
| ------ | ------ | :--: | ------ | ------- |
| `evId` | string |  ✅  | -      | 动态 id |

## HTTP 示例

```bash
GET /event/del?evId=6712917601
```

## 编程式调用

```ts
import { eventDel } from 'hana-music-api'

const result = await eventDel({
  evId: '6712917601',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可以删除用户动态

**必选参数 :** `evId` : 动态 id

**接口地址 :** `/event/del`

**调用例子 :** `/event/del?evId=6712917601`
