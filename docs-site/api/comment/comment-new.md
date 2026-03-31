---
title: '新版评论接口'
description: '调用此接口 , 传入资源类型和资源 id,以及排序方式,可获取对应资源的评论'
---

# 新版评论接口

> 调用此接口 , 传入资源类型和资源 id,以及排序方式,可获取对应资源的评论

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/comment/new` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `comment_new`  |
| 文档分类 | 评论           |

## 请求参数

| 参数       | 类型             | 必填 | 默认值 | 说明                                                                                                                                                            |
| ---------- | ---------------- | :--: | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | string           |  ✅  | -      | 资源 id, 如歌曲 id,mv id                                                                                                                                        |
| `type`     | string           |  ✅  | -      | 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |
| `pageNo`   | number \| string |  —   | 1      | 分页参数,第 N 页,默认为 1                                                                                                                                       |
| `pageSize` | number \| string |  —   | 20     | 分页参数,每页多少条数据,默认 20                                                                                                                                 |
| `sortType` | string           |  —   | -      | 排序方式, 1:按推荐排序, 2:按热度排序, 3:按时间排序                                                                                                              |
| `cursor`   | number \| string |  —   | -      | 当`sortType`为 3 时且页数不是第一页时需传入,值为上一条数据的 time                                                                                               |

## HTTP 示例

```bash
GET /comment/new?type=0&id=1407551413&sortType=3
GET /comment/new?type=0&id=1407551413&sortType=3&cursor=1602072870260&pageSize=20&pageNo=2
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.comment_new({
  type: '0',
  id: '1407551413',
  sortType: '3',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入资源类型和资源 id,以及排序方式,可获取对应资源的评论

**必选参数 :**  
`id` : 资源 id, 如歌曲 id,mv id

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

**可选参数 :**  
`pageNo`:分页参数,第 N 页,默认为 1

`pageSize`:分页参数,每页多少条数据,默认 20

`sortType`: 排序方式, 1:按推荐排序, 2:按热度排序, 3:按时间排序

`cursor`: 当`sortType`为 3 时且页数不是第一页时需传入,值为上一条数据的 time

**接口地址 :** `/comment/new`

**调用例子 :** `/comment/new?type=0&id=1407551413&sortType=3`, `/comment/new?type=0&id=1407551413&sortType=3&cursor=1602072870260&pageSize=20&pageNo=2`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
