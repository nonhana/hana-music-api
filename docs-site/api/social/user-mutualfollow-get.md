---
title: "用户是否互相关注"
description: "登录后调用此接口, 传入用户id, 可判断用户是否互相关注"
---

# 用户是否互相关注

> 登录后调用此接口, 传入用户id, 可判断用户是否互相关注

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/user/mutualfollow/get` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `user_mutualfollow_get` |
| 文档分类 | 社交与消息 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `uid` | string | ✅ | - | 用户 id |

## HTTP 示例

```bash
GET /user/mutualfollow/get?uid=32953014
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_mutualfollow_get({
  uid: "32953014",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 传入用户id, 可判断用户是否互相关注

**必选参数 :**  

`uid`: 用户 id

**接口地址 :** `/user/mutualfollow/get`

**调用例子 :** `/user/mutualfollow/get?uid=32953014`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
