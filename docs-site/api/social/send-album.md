---
title: '发送私信(带专辑)'
description: '登录后调用此接口 , 传入用户 id 和要发送的信息,专辑 id, 可以发送专辑私信,返回内容为消息 id'
---

# 发送私信(带专辑)

> 登录后调用此接口 , 传入用户 id 和要发送的信息,专辑 id, 可以发送专辑私信,返回内容为消息 id

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/send/album`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `send_album`   |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                     |
| ---------- | ------------------ | :--: | ------ | ------------------------ |
| `user_ids` | string[] \| string |  ✅  | -      | 用户 id,多个需用逗号隔开 |
| `id`       | string             |  ✅  | -      | 要发送专辑的 id          |
| `msg`      | string             |  ✅  | -      | 要发送的信息             |

## HTTP 示例

```bash
GET /send/album?user_ids=1&id=351318&msg=测试
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.send_album({
  user_ids: '1',
  id: '351318',
  msg: '测试',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息,专辑 id, 可以发送专辑私信,返回内容为消息 id

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`id` : 要发送专辑的 id

`msg` : 要发送的信息

**接口地址 :** `/send/album`

**调用例子 :** `/send/album?user_ids=1&id=351318&msg=测试`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
