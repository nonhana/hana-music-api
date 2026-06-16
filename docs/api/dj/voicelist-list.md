---
title: '播客声音列表'
description: '可以获取播客里的声音'
---

# 播客声音列表

> 可以获取播客里的声音

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/voicelist/list` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `voicelist_list`  |
| 文档分类 | 电台与播客        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voicelist/list
```

## 编程式调用

```ts
import { voicelistList } from 'hana-music-api'

const result = await voicelistList()

console.log(result.body)
```

## 补充说明

说明: 可以获取播客里的声音

**接口地址:** `/voicelist/list`

**必选参数：**
`voiceListId`: 播客id

返回结果的`displayStatus`参数对应:

```text
AUDITING 审核中
ONLY_SELF_SEE 仅自己可见
ONLINE 已发布
```

**可选参数：**
`limit`: 取出歌单数量，默认为 200

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*200, 其中 200 为 limit 的值
