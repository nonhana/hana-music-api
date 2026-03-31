---
title: "曲风-歌手"
description: "调用此接口可以获取该曲风对应的歌手"
---

# 曲风-歌手

> 调用此接口可以获取该曲风对应的歌手

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/style/artist` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `style_artist` |
| 文档分类 | 曲风 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `tagId` | string | ✅ | - | 曲风 ID |
| `size` | number \| string | — | 20 | 返回数量 , 默认为 20 |
| `cursor` | number \| string | — | 0 | 返回数据的 cursor, 默认为 0 , 传入上一次返回结果的 cursor,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /style/artist?tagId=1000
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.style_artist({
  tagId: "1000",
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取该曲风对应的歌手

**接口地址:** `/style/artist`

**必选参数:** `tagId`: 曲风 ID

**可选参数 :** `size` : 返回数量 , 默认为 20

`cursor` : 返回数据的 cursor, 默认为 0 , 传入上一次返回结果的 cursor,将会返回下一页的数据

**调用例子:** `/style/artist?tagId=1000`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
