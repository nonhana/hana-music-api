---
title: "删除用户动态"
description: "登录后调用此接口 ,可以删除用户动态"
---

# 删除用户动态

> 登录后调用此接口 ,可以删除用户动态

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/event/del` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `event_del` |
| 文档分类 | 社交与消息 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `evId` | string | ✅ | - | 动态 id |

## HTTP 示例

```bash
GET /event/del?evId=6712917601
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.event_del({
  evId: "6712917601",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可以删除用户动态

**必选参数 :** `evId` : 动态 id

**接口地址 :** `/event/del`

**调用例子 :** `/event/del?evId=6712917601`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
