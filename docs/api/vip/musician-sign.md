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

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /musician/sign
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.musician_sign()

console.log(result.body)
```

## 补充说明

说明: 音乐人登录后调用此接口，可以完成“登录音乐人中心”任务，然后通过`/musician/cloudbean/obtain`接口可以领取相应的云豆。

**接口地址 :** `/musician/sign`

**调用例子 :** `/musician/sign`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
