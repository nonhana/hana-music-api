---
title: '账号云豆数'
description: '音乐人登录后调用此接口 , 可获取账号云豆数'
---

# 账号云豆数

> 音乐人登录后调用此接口 , 可获取账号云豆数

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/musician/cloudbean` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `musician_cloudbean`  |
| 文档分类 | 会员与云贝            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /musician/cloudbean
```

## 编程式调用

```ts
import { musicianCloudbean } from 'hana-music-api'

const result = await musicianCloudbean()

console.log(result.body)
```

## 补充说明

说明 : 音乐人登录后调用此接口 , 可获取账号云豆数

**接口地址 :** `/musician/cloudbean`

**调用例子 :** `/musician/cloudbean`
