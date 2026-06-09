---
title: '数字专辑-语种风格馆'
description: '调用此接口 ,可获取语种风格馆数字专辑列表'
---

# 数字专辑-语种风格馆

> 调用此接口 ,可获取语种风格馆数字专辑列表

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/album/list/style` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `album_list_style`  |
| 文档分类 | 专辑                |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                      |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量 , 默认为 30                                                      |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0 |
| `area`   | string           |  —   | -      | 地区 Z_H:华语,E_A:欧美,KR:韩国,JP:日本                                    |

## HTTP 示例

```bash
GET /album/list/style?area=Z_H&offset=2
```

## 编程式调用

```ts
import { albumListStyle } from 'hana-music-api'

const result = await albumListStyle({
  area: 'Z_H',
  offset: '2',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,可获取语种风格馆数字专辑列表

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

`area` 地区 Z_H:华语,E_A:欧美,KR:韩国,JP:日本

**接口地址 :** `/album/list/style`

**调用例子 :** `/album/list/style?area=Z_H&offset=2`
