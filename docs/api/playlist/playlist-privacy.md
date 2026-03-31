---
title: "公开隐私歌单"
description: "可以调用此接口将当前用户的隐私歌单公开。"
---

# 公开隐私歌单

> 可以调用此接口将当前用户的隐私歌单公开。

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/privacy` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_privacy` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌单 ID |

## HTTP 示例

```bash
GET /playlist/privacy
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_privacy({
  id: "123456",
})

console.log(result.body)
```

## 补充说明

说明: 可以调用此接口将当前用户的隐私歌单公开。

**必选参数 :** `id` : 歌单 ID

**接口地址 :** `/playlist/privacy`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
