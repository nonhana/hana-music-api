---
title: "用户的创建歌单列表"
description: "调用此接口, 传入用户id, 获取用户的创建歌单列表"
---

# 用户的创建歌单列表

> 调用此接口, 传入用户id, 获取用户的创建歌单列表

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/user/playlist/create` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `user_playlist_create` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `uid` | string | ✅ | - | 用户 id |
| `limit` | number \| string | — | 100 | 返回数量 , 默认为 100 |
| `offset` | number \| string | — | 0 | 偏移数量，用于分页 ,如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0 |

## HTTP 示例

```bash
GET /user/playlist/create?uid=32953014
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_playlist_create({
  uid: "32953014",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口, 传入用户id, 获取用户的创建歌单列表

**必选参数 :**  

`uid`: 用户 id

**可选参数 :**

`limit` : 返回数量 , 默认为 100

`offset` : 偏移数量，用于分页 ,如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/user/playlist/create`

**调用例子 :** `/user/playlist/create?uid=32953014`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
