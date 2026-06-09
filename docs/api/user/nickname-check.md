---
title: '重复昵称检测'
description: '调用此接口 ,可检测昵称是否重复,并提供备用昵称'
---

# 重复昵称检测

> 调用此接口 ,可检测昵称是否重复,并提供备用昵称

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/nickname/check` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `nickname_check`  |
| 文档分类 | 用户与登录        |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明 |
| ---------- | ------ | :--: | ------ | ---- |
| `nickname` | string |  ✅  | -      | 昵称 |

## HTTP 示例

```bash
GET /nickname/check?nickname=binaryify
```

## 编程式调用

```ts
import { nicknameCheck } from 'hana-music-api'

const result = await nicknameCheck({
  nickname: 'binaryify',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,可检测昵称是否重复,并提供备用昵称
**必选参数 :**
`nickname` : 昵称

**接口地址 :** `/nickname/check`

**调用例子 :** `/nickname/check?nickname=binaryify`
