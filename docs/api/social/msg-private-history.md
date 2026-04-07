---
title: '私信内容'
description: '登录后调用此接口 , 可获取私信内容'
---

# 私信内容

> 登录后调用此接口 , 可获取私信内容

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/msg/private/history` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 是                     |
| 对应模块 | `msg_private_history`  |
| 文档分类 | 社交与消息             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                              |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------- |
| `uid`    | string           |  ✅  | -      | 用户 id                                           |
| `limit`  | number \| string |  —   | 30     | 返回数量 , 默认为 30                              |
| `before` | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据 |

## HTTP 示例

```bash
GET /msg/private/history?uid=9003
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.msg_private_history({
  uid: '9003',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可获取私信内容

**必选参数 :**
`uid` : 用户 id

**可选参数 :**
`limit` : 返回数量 , 默认为 30

`before` : 分页参数,取上一页最后一项的 `time` 获取下一页数据

**接口地址 :**
`/msg/private/history`

**调用例子 :**
`/msg/private/history?uid=9003` (云音乐小秘书)

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
