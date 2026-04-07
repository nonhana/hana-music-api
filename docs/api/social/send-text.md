---
title: '发送私信'
description: '登录后调用此接口 , 传入用户 id 和要发送的信息, 可以发送私信,返回内容为历史私信,包含带歌单的私信信息(注:不能发送私信给自己)'
---

# 发送私信

> 登录后调用此接口 , 传入用户 id 和要发送的信息, 可以发送私信,返回内容为历史私信,包含带歌单的私信信息(注:不能发送私信给自己)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/send/text`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `send_text`    |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                     |
| ---------- | ------------------ | :--: | ------ | ------------------------ |
| `user_ids` | string[] \| string |  ✅  | -      | 用户 id,多个需用逗号隔开 |
| `msg`      | string             |  ✅  | -      | 要发送的信息             |

## HTTP 示例

```bash
GET /send/text?user_ids=32953014&msg=test
GET /send/text?user_ids=32953014,475625142&msg=test
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.send_text({
  user_ids: '32953014',
  msg: 'test',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息, 可以发送私信,返回内容为历史私信,包含带歌单的私信信息(注:不能发送私信给自己)

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`msg` : 要发送的信息

**接口地址 :** `/send/text`

**调用例子 :** `/send/text?user_ids=32953014&msg=test`,`/send/text?user_ids=32953014,475625142&msg=test`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
