---
title: '数字专辑详情'
description: '调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)'
---

# 数字专辑详情

> 调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/album/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `album_detail`  |
| 文档分类 | 专辑            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /album/detail?id=84547195
```

## 编程式调用

```ts
import { albumDetail } from 'hana-music-api'

const result = await albumDetail({
  id: '84547195',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)

**接口地址 :** `/album/detail`

**调用例子 :** `/album/detail?id=84547195`
