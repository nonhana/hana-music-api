---
title: '签到进度'
description: '调用此接口 , 可获得签到进度'
---

# 签到进度

> 调用此接口 , 可获得签到进度

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/signin/progress` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `signin_progress`  |
| 文档分类 | 会员与云贝         |

## 请求参数

| 参数       | 类型   | 必填 | 默认值                  | 说明                                    |
| ---------- | ------ | :--: | ----------------------- | --------------------------------------- |
| `moduleId` | string |  —   | '1207signin-1207signin' | 模块 id，默认为 '1207signin-1207signin' |

## HTTP 示例

```bash
GET /signin/progress?moduleId=1207signin-1207signin
```

## 编程式调用

```ts
import { signinProgress } from 'hana-music-api'

const result = await signinProgress({
  moduleId: '1207signin-1207signin',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得签到进度

**可选参数 :** `moduleId` : 模块 id，默认为 '1207signin-1207signin'

**接口地址 :** `/signin/progress`

**调用例子 :** `/signin/progress?moduleId=1207signin-1207signin`
