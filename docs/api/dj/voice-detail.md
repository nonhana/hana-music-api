---
title: '播客声音详情'
description: '获取播客里的声音详情'
---

# 播客声音详情

> 获取播客里的声音详情

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/voice/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `voice_detail`  |
| 文档分类 | 电台与播客      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voice/detail
```

## 编程式调用

```ts
import { voiceDetail } from 'hana-music-api'

const result = await voiceDetail()

console.log(result.body)
```

## 补充说明

说明: 获取播客里的声音详情

**接口地址:** `/voice/detail`

**必选参数：**
`id`: 播客声音id(voiceId)

返回结果的`displayStatus`参数对应:

```
同上
```
