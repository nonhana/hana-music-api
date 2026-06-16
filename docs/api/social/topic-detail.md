---
title: '获取话题详情'
description: '调用此接口，可获取话题详情'
---

# 获取话题详情

> 调用此接口，可获取话题详情

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/topic/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `topic_detail`  |
| 文档分类 | 社交与消息      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /topic/detail?actid=111551188
```

## 编程式调用

```ts
import { topicDetail } from 'hana-music-api'

const result = await topicDetail({
  actid: '111551188',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获取话题详情

**接口地址 :** `/topic/detail`

**调用例子 :** `/topic/detail?actid=111551188`
