---
title: '歌曲动态封面'
description: '登录后调用此接口, 传入歌曲id, 获取歌曲动态封面'
---

# 歌曲动态封面

> 登录后调用此接口, 传入歌曲id, 获取歌曲动态封面

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/song/dynamic/cover` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `song_dynamic_cover`  |
| 文档分类 | 歌曲与播放            |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /song/dynamic/cover?id=2101179024
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.song_dynamic_cover({
  id: '2101179024',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 传入歌曲id, 获取歌曲动态封面

**必选参数 :**

`id`: 歌曲 id

**接口地址 :** `/song/dynamic/cover`

**调用例子 :** `/song/dynamic/cover?id=2101179024`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
