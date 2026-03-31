---
title: "根据nickname获取userid"
description: "使用此接口,传入用户昵称,可获取对应的用户id,支持批量获取,多个昵称用`分号(;)`隔开"
---

# 根据nickname获取userid

> 使用此接口,传入用户昵称,可获取对应的用户id,支持批量获取,多个昵称用`分号(;)`隔开

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/get/userids` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `get_userids` |
| 文档分类 | 用户与登录 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /get/userids?nicknames=binaryify
GET /get/userids?nicknames=binaryify;binaryify2
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.get_userids({
  nicknames: "binaryify",
})

console.log(result.body)
```

## 补充说明

说明: 使用此接口,传入用户昵称,可获取对应的用户id,支持批量获取,多个昵称用`分号(;)`隔开  

**必选参数：**  

`nicknames`: 用户昵称,多个用分号(;)隔开

**接口地址:** `/get/userids`

**调用例子:** `/get/userids?nicknames=binaryify` `/get/userids?nicknames=binaryify;binaryify2`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
