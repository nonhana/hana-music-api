---
title: '搜索建议'
description: '调用此接口 , 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单信息'
---

# 搜索建议

> 调用此接口 , 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单信息

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/search/suggest` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `search_suggest`  |
| 文档分类 | 搜索              |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明                             |
| ---------- | ------ | :--: | ------ | -------------------------------- |
| `keywords` | string |  ✅  | -      | 关键词                           |
| `type`     | string |  —   | -      | 如果传 'mobile' 则返回移动端数据 |

## HTTP 示例

```bash
GET /search/suggest?keywords=海阔天空
GET /search/suggest?keywords=海阔天空&type=mobile
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.search_suggest({
  keywords: '海阔天空',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单信息

**必选参数 :** `keywords` : 关键词

**可选参数 :** `type` : 如果传 'mobile' 则返回移动端数据

**接口地址 :** `/search/suggest`

**调用例子 :** `/search/suggest?keywords=海阔天空` `/search/suggest?keywords=海阔天空&type=mobile`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
