---
title: '新建歌单'
description: '调用此接口 , 传入歌单名字可新建歌单'
---

# 新建歌单

> 调用此接口 , 传入歌单名字可新建歌单

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/create` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `playlist_create`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数      | 类型   | 必填 | 默认值      | 说明                                                                 |
| --------- | ------ | :--: | ----------- | -------------------------------------------------------------------- |
| `name`    | string |  ✅  | -           | 歌单名                                                               |
| `privacy` | string |  —   | 否          | 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单                   |
| `type`    | string |  —   | 'NORMAL',传 | 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单 |

## HTTP 示例

```bash
GET /playlist/create?name=测试歌单
GET /playlist/create?name=test&type=VIDEO
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_create({
  name: '测试歌单',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌单名字可新建歌单

**必选参数 :** `name` : 歌单名

**可选参数 :**

`privacy` : 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单

`type` : 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单

**接口地址 :** `/playlist/create`

**调用例子 :** `/playlist/create?name=测试歌单`,`/playlist/create?name=test&type=VIDEO`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
