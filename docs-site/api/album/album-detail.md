---
title: "数字专辑详情"
description: "调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)"
---

# 数字专辑详情

> 调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/album/detail` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `album_detail` |
| 文档分类 | 专辑 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /album/detail?id=84547195
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.album_detail({
  id: "84547195",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)

**接口地址 :** `/album/detail`

**调用例子 :** `/album/detail?id=84547195`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
