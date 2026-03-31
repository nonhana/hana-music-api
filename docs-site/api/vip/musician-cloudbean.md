---
title: "账号云豆数"
description: "音乐人登录后调用此接口 , 可获取账号云豆数"
---

# 账号云豆数

> 音乐人登录后调用此接口 , 可获取账号云豆数

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/musician/cloudbean` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `musician_cloudbean` |
| 文档分类 | 会员与云贝 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /musician/cloudbean
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.musician_cloudbean()

console.log(result.body)
```

## 补充说明

说明 : 音乐人登录后调用此接口 , 可获取账号云豆数

**接口地址 :** `/musician/cloudbean`

**调用例子 :** `/musician/cloudbean`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
