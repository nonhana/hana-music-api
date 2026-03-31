---
title: '电台 - 节目'
description: '登录后调用此接口 , 传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要'
---

# 电台 - 节目

> 登录后调用此接口 , 传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/program`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_program`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                      |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------- |
| `rid`    | string           |  ✅  | -      | 电台 的 id                                                                |
| `limit`  | number \| string |  —   | 30     | 返回数量 , 默认为 30                                                      |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0 |
| `asc`    | boolean          |  —   | false  | 排序方式,默认为 `false` (新 => 老 ) 设置 `true` 可改为 老 => 新           |

## HTTP 示例

```bash
GET /dj/program?rid=336355127&limit=40
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_program({
  rid: '336355127',
  limit: '40',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要
注意的是这个接口返回的 mp3Url 已经无效 , 都为 null, 但是通过调用 `/song/url` 这
个接口 , 传入节目 mainTrackId 仍然能获取到节目音频 , 如 `/song/url?id=478446370` 获取代
码时间的一个节目的音频

**必选参数 :** `rid`: 电台 的 id

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

`asc` : 排序方式,默认为 `false` (新 => 老 ) 设置 `true` 可改为 老 => 新

**接口地址 :** `/dj/program`

**调用例子 :** `/dj/program?rid=336355127&limit=40` ( 对应 ' 代码时间 ' 的节目列表 )

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
