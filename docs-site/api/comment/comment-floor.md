---
title: '楼层评论'
description: '调用此接口 , 传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论'
---

# 楼层评论

> 调用此接口 , 传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/comment/floor` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `comment_floor`  |
| 文档分类 | 评论             |

## 请求参数

| 参数              | 类型             | 必填 | 默认值 | 说明                                                                                                                                                            |
| ----------------- | ---------------- | :--: | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentCommentId` | string           |  ✅  | -      | 楼层评论 id                                                                                                                                                     |
| `id`              | string           |  ✅  | -      | 资源 id                                                                                                                                                         |
| `type`            | string           |  ✅  | -      | 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |
| `limit`           | number \| string |  —   | 20     | 取出评论数量 , 默认为 20                                                                                                                                        |
| `time`            | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据                                                                                                               |

## HTTP 示例

```bash
GET /comment/floor?parentCommentId=1438569889&id=29764564&type=0
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.comment_floor({
  parentCommentId: '1438569889',
  id: '29764564',
  type: '0',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论

**必选参数 :**  
`parentCommentId`: 楼层评论 id

`id` : 资源 id

`type`: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型

```
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台节目

5: 视频

6: 动态

7: 电台
```

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`time`: 分页参数,取上一页最后一项的 `time` 获取下一页数据

**接口地址 :** `/comment/floor`

**调用例子 :** `/comment/floor?parentCommentId=1438569889&id=29764564&type=0`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
