---
title: "收藏/取消收藏歌单"
description: "调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单"
---

# 收藏/取消收藏歌单

> 调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/subscribe` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_subscribe` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `t` | string | ✅ | - | 类型,1:收藏,2:取消收藏 |
| `id` | string | ✅ | - | 歌单 id |

## HTTP 示例

```bash
GET /playlist/subscribe?t=1&id=106697785
GET /playlist/subscribe?t=2&id=106697785
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_subscribe({
  t: "1",
  id: "106697785",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单

**必选参数 :**

`t` : 类型,1:收藏,2:取消收藏  

`id` : 歌单 id

**接口地址 :** `/playlist/subscribe`

**调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
