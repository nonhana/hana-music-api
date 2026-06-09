---
title: '初始化昵称'
description: '刚注册的账号(需登录),调用此接口 ,可初始化昵称'
---

# 初始化昵称

> 刚注册的账号(需登录),调用此接口 ,可初始化昵称

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/activate/init/profile` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 是                       |
| 对应模块 | `activate_init_profile`  |
| 文档分类 | 用户与登录               |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明 |
| ---------- | ------ | :--: | ------ | ---- |
| `nickname` | string |  ✅  | -      | 昵称 |

## HTTP 示例

```bash
GET /activate/init/profile?nickname=testUser2019
```

## 编程式调用

```ts
import { activateInitProfile } from 'hana-music-api'

const result = await activateInitProfile({
  nickname: 'testUser2019',
})

console.log(result.body)
```

## 补充说明

说明 : 刚注册的账号(需登录),调用此接口 ,可初始化昵称  
**必选参数 :**
`nickname` : 昵称

**接口地址 :** `/activate/init/profile`

**调用例子 :** `/activate/init/profile?nickname=testUser2019`
