---
title: '获取视频标签列表'
description: '调用此接口，可获取视频标签列表'
---

# 获取视频标签列表

> 调用此接口，可获取视频标签列表

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/video/group/list` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `video_group_list`  |
| 文档分类 | 视频与 MV           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /video/group/list
```

## 编程式调用

```ts
import { videoGroupList } from 'hana-music-api'

const result = await videoGroupList()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获取视频标签列表

**接口地址 :** `/video/group/list`

**调用例子 :** `/video/group/list`
