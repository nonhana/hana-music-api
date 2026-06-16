---
title: '获取话题详情热门动态'
description: '调用此接口，可获取话题详情热门动态'
---

# 获取话题详情热门动态

> 调用此接口，可获取话题详情热门动态

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/topic/detail/event/hot` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 否                        |
| 对应模块 | `topic_detail_event_hot`  |
| 文档分类 | 社交与消息                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /topic/detail/event/hot?actid=111551188
```

## 编程式调用

```ts
import { topicDetailEventHot } from 'hana-music-api'

const result = await topicDetailEventHot({
  actid: '111551188',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获取话题详情热门动态

**接口地址 :** `/topic/detail/event/hot`

**调用例子 :** `/topic/detail/event/hot?actid=111551188`
