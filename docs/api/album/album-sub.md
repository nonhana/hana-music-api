---
title: "收藏/取消收藏专辑"
description: "调用此接口,可收藏/取消收藏专辑"
---

# 收藏/取消收藏专辑

> 调用此接口,可收藏/取消收藏专辑

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/album/sub` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `album_sub` |
| 文档分类 | 专辑 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 专辑 id |
| `t` | string | ✅ | - | 1 为收藏,其他为取消收藏 |

## HTTP 示例

```bash
GET /album/sub?t=1
GET /album/sub?t=0
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.album_sub({
  t: "1",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可收藏/取消收藏专辑

**必选参数 :**

`id` : 专辑 id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/album/sub`

**调用例子 :** `/album/sub?t=1` `/album/sub?t=0`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
