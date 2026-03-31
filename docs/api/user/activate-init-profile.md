---
title: "初始化昵称"
description: "刚注册的账号(需登录),调用此接口 ,可初始化昵称"
---

# 初始化昵称

> 刚注册的账号(需登录),调用此接口 ,可初始化昵称

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/activate/init/profile` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `activate_init_profile` |
| 文档分类 | 用户与登录 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `nickname` | string | ✅ | - | 昵称 |

## HTTP 示例

```bash
GET /activate/init/profile?nickname=testUser2019
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.activate_init_profile({
  nickname: "testUser2019",
})

console.log(result.body)
```

## 补充说明

说明 : 刚注册的账号(需登录),调用此接口 ,可初始化昵称  
**必选参数 :**
`nickname` : 昵称

**接口地址 :** `/activate/init/profile`

**调用例子 :** `/activate/init/profile?nickname=testUser2019`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
