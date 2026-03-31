---
title: '获取精品歌单'
description: '调用此接口 , 可获取精品歌单'
---

# 获取精品歌单

> 调用此接口 , 可获取精品歌单

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/top/playlist/highquality` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `top_playlist_highquality`  |
| 文档分类 | 歌单                        |

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                                                                           |
| -------- | ------------------ | :--: | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `cat`    | string[] \| string |  —   | 为     | tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为<br>"全部",可从精品歌单标签列表接口获取(`/playlist/highquality/tags`) |
| `limit`  | number \| string   |  —   | 50     | 取出歌单数量 , 默认为 50                                                                                                       |
| `before` | number \| string   |  —   | -      | 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据                                                                    |

## HTTP 示例

```bash
GET /top/playlist/highquality?before=1503639064232&limit=3
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.top_playlist_highquality({
  before: '1503639064232',
  limit: '3',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取精品歌单

**可选参数 :** `cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
"全部",可从精品歌单标签列表接口获取(`/playlist/highquality/tags`)

`limit`: 取出歌单数量 , 默认为 50

`before`: 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据

**接口地址 :** `/top/playlist/highquality`

**调用例子 :** `/top/playlist/highquality?before=1503639064232&limit=3`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
