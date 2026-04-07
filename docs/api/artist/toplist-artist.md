---
title: '歌手榜'
description: '调用此接口 , 可获取排行榜中的歌手榜'
---

# 歌手榜

> 调用此接口 , 可获取排行榜中的歌手榜

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/toplist/artist` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `toplist_artist`  |
| 文档分类 | 歌手              |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                             |
| ------ | ------ | :--: | ------ | ------------------------------------------------ |
| `type` | string |  —   | -      | 地区<br>1: 华语<br>2: 欧美<br>3: 韩国<br>4: 日本 |

## HTTP 示例

```bash
GET /toplist/artist
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.toplist_artist()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取排行榜中的歌手榜

**可选参数 :**

```
type : 地区
1: 华语
2: 欧美
3: 韩国
4: 日本
```

**接口地址 :** `/toplist/artist`

**调用例子 :** `/toplist/artist`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
