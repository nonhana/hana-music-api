---
title: "云贝推歌"
description: "登录后调用此接口 , 传入歌曲 id, 可以进行云贝推歌"
---

# 云贝推歌

> 登录后调用此接口 , 传入歌曲 id, 可以进行云贝推歌

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/yunbei/rcmd/song` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `yunbei_rcmd_song` |
| 文档分类 | 会员与云贝 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌曲 id |
| `reason` | string | — | - | 推歌理由 |
| `yunbeiNum` | number \| string | — | 10 | 云贝数量,默认10 |

## HTTP 示例

```bash
GET /yunbei/rcmd/song?id=65528
GET /yunbei/rcmd/song?id=65528&reason=人间好声音推荐给你听
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.yunbei_rcmd_song({
  id: "65528",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入歌曲 id, 可以进行云贝推歌

**必选参数 :** `id` : 歌曲 id

**可选参数 :** `reason` : 推歌理由

`yunbeiNum`: 云贝数量,默认10

**接口地址 :** `/yunbei/rcmd/song`

**调用例子 :** `/yunbei/rcmd/song?id=65528` `/yunbei/rcmd/song?id=65528&reason=人间好声音推荐给你听`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
