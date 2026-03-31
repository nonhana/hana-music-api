---
title: "删除歌单"
description: "调用此接口 , 传入歌单 id 可删除歌单"
---

# 删除歌单

> 调用此接口 , 传入歌单 id 可删除歌单

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/delete` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_delete` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string[] \| string | ✅ | - | 歌单 id,可多个,用逗号隔开 |

## HTTP 示例

```bash
GET /playlist/delete?id=2947311456
GET /playlist/delete?id=5013464397,5013427772
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_delete({
  id: "2947311456",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌单 id 可删除歌单

**必选参数 :** `id` : 歌单 id,可多个,用逗号隔开

**接口地址 :** `/playlist/delete`

**调用例子 :** `/playlist/delete?id=2947311456` , `/playlist/delete?id=5013464397,5013427772`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
