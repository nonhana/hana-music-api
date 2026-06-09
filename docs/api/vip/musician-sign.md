---
title: '音乐人签到'
description: '音乐人登录后调用此接口，可以完成“登录音乐人中心”任务，然后通过`/musician/cloudbean/obtain`接口可以领取相应的云豆。'
---

# 音乐人签到

> 音乐人登录后调用此接口，可以完成“登录音乐人中心”任务，然后通过`/musician/cloudbean/obtain`接口可以领取相应的云豆。

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/musician/sign` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `musician_sign`  |
| 文档分类 | 会员与云贝       |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /musician/sign
```

## 编程式调用

```ts
import { musicianSign } from 'hana-music-api'

const result = await musicianSign()

console.log(result.body)
```

## 补充说明

说明: 音乐人登录后调用此接口，可以完成“登录音乐人中心”任务，然后通过`/musician/cloudbean/obtain`接口可以领取相应的云豆。

**接口地址 :** `/musician/sign`

**调用例子 :** `/musician/sign`
