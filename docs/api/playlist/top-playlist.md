---
title: '歌单 ( 网友精选碟 )'
description: '调用此接口 , 可获取网友精选碟歌单'
---

# 歌单 ( 网友精选碟 )

> 调用此接口 , 可获取网友精选碟歌单

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/top/playlist` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `top_playlist`  |
| 文档分类 | 歌单            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                                                        |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------------------------------------------- |
| `order`  | string           |  —   | 为     | 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为<br>'hot'                                               |
| `cat`    | string           |  —   | 为     | tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为<br>"全部",可从歌单分类接口获取(/playlist/catlist) |
| `limit`  | number \| string |  —   | 50     | 取出歌单数量 , 默认为 50                                                                                    |
| `offset` | number \| string |  —   | -      | 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值                                         |

## HTTP 示例

```bash
GET /top/playlist?limit=10&order=new
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.top_playlist({
  limit: '10',
  order: 'new',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取网友精选碟歌单

**可选参数 :** `order`: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为
'hot'

`cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
"全部",可从歌单分类接口获取(/playlist/catlist)

`limit`: 取出歌单数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/top/playlist`

**调用例子 :** `/top/playlist?limit=10&order=new`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
