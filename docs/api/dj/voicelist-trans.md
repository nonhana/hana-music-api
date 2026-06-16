---
title: '播客声音排序'
description: '调整声音在列表中的顺序, 每个声音都有固定的序号, 例如将4的声音移动到1后, 原来的1、2、3增加为2、3、4, 其他不变'
---

# 播客声音排序

> 调整声音在列表中的顺序, 每个声音都有固定的序号, 例如将4的声音移动到1后, 原来的1、2、3增加为2、3、4, 其他不变

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/voicelist/trans` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `voicelist_trans`  |
| 文档分类 | 电台与播客         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voicelist/trans
```

## 编程式调用

```ts
import { voicelistTrans } from 'hana-music-api'

const result = await voicelistTrans()

console.log(result.body)
```

## 补充说明

说明: 调整声音在列表中的顺序, 每个声音都有固定的序号, 例如将4的声音移动到1后, 原来的1、2、3增加为2、3、4, 其他不变

**接口地址:** `/voicelist/trans`

**必选参数：**
`limit`: 取出歌单数量，默认为 200

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*200, 其中 200 为 limit 的值

`position`: 位置, 最小为1, 最大为歌曲数量, 超过最大则为移动到最底, 小于1报错

`programId`: 播客声音id, 即voiceId

`radioId`: 电台id, 即voiceListId
