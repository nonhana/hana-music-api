---
title: "用户贡献条目、积分、云贝数量"
description: "登录后调用此接口,使用此接口,可获取当前登录用户贡献条目、积分、云贝数量"
---

# 用户贡献条目、积分、云贝数量

> 登录后调用此接口,使用此接口,可获取当前登录用户贡献条目、积分、云贝数量

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/ugc/user/devote` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `ugc_user_devote` |
| 文档分类 | 百科与用户贡献 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /ugc/user/devote
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.ugc_user_devote()

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,可获取当前登录用户贡献条目、积分、云贝数量

**接口地址:** `/ugc/user/devote`

**调用例子:** `/ugc/user/devote`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
