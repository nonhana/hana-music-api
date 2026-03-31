---
title: '歌手分类列表'
description: '调用此接口,可获取歌手分类列表'
---

# 歌手分类列表

> 调用此接口,可获取歌手分类列表

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/artist/list` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `artist_list`  |
| 文档分类 | 歌手           |

## 请求参数

| 参数      | 类型             | 必填 | 默认值 | 说明                                                                                                                                       |
| --------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `limit`   | number \| string |  —   | 30     | 返回数量 , 默认为 30                                                                                                                       |
| `offset`  | number \| string |  —   | 0      | 偏移数量，用于分页 , 如<br>: 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0                                                          |
| `initial` | string           |  —   | -      | 按首字母索引查找参数,如 `/artist/list?type=1&area=96&initial=b` 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列, 热门传-1,#传 0 |
| `type`    | string           |  —   | -      | 取值:<br>-1:全部<br>1:男歌手<br>2:女歌手<br>3:乐队                                                                                         |
| `area`    | string           |  —   | -      | 取值:<br>-1:全部<br>7华语<br>96欧美<br>8:日本<br>16韩国<br>0:其他                                                                          |

## HTTP 示例

```bash
GET /artist/list?type=1&area=96&initial=b
GET /artist/list?type=2&area=2&initial=b
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.artist_list({
  type: '1',
  area: '96',
  initial: 'b',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取歌手分类列表

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如
: 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0
`initial`: 按首字母索引查找参数,如 `/artist/list?type=1&area=96&initial=b` 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列, 热门传-1,#传 0

`type` 取值:

```
-1:全部
1:男歌手
2:女歌手
3:乐队
```

`area` 取值:

```
-1:全部
7华语
96欧美
8:日本
16韩国
0:其他
```

**接口地址 :** `/artist/list`

**调用例子 :** `/artist/list?type=1&area=96&initial=b` `/artist/list?type=2&area=2&initial=b`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
