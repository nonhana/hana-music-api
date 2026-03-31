---
title: '获取专辑歌曲的音质'
description: '调用后可获取专辑歌曲的音质'
---

# 获取专辑歌曲的音质

> 调用后可获取专辑歌曲的音质

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/album/privilege` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `album_privilege`  |
| 文档分类 | 专辑               |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 专辑 id |

## HTTP 示例

```bash
GET /album/privilege?id=168223858
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.album_privilege({
  id: '168223858',
})

console.log(result.body)
```

## 补充说明

说明 : 调用后可获取专辑歌曲的音质

**必选参数 :** `id` : 专辑 id

**接口地址 :** `/album/privilege`

**调用例子 :** `/album/privilege?id=168223858`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
