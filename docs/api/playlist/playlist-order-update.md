---
title: '调整歌单顺序'
description: '登录后调用此接口,可以根据歌单 id 顺序调整歌单顺序'
---

# 调整歌单顺序

> 登录后调用此接口,可以根据歌单 id 顺序调整歌单顺序

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/playlist/order/update` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 是                       |
| 对应模块 | `playlist_order_update`  |
| 文档分类 | 歌单                     |

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明         |
| ----- | ------------------ | :--: | ------ | ------------ |
| `ids` | string[] \| string |  ✅  | -      | 歌单 id 列表 |

## HTTP 示例

```bash
GET /playlist/order/update?ids=[111,222]
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_order_update({
  ids: '[111,222]',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,可以根据歌单 id 顺序调整歌单顺序

**必选参数 :**

`ids`: 歌单 id 列表

**接口地址 :** `/playlist/order/update`

**调用例子 :** `/playlist/order/update?ids=[111,222]`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
