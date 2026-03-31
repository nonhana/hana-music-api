---
title: "更新歌单"
description: "登录后调用此接口,可以更新用户歌单"
---

# 更新歌单

> 登录后调用此接口,可以更新用户歌单

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/update` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `playlist_update` |
| 文档分类 | 歌单 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 歌单id |
| `name` | string | ✅ | - | 歌单名字 |
| `desc` | string | ✅ | - | 歌单描述 |
| `tags` | string[] \| string | ✅ | - | 歌单tag ,多个用 `;` 隔开,只能用官方规定标签 |

## HTTP 示例

```bash
GET /playlist/update?id=24381616&name=新歌单&desc=描述&tags=欧美
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_update({
  id: "24381616",
  name: "新歌单",
  desc: "描述",
  tags: "欧美",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口,可以更新用户歌单

**必选参数 :**

```
id:歌单id

name:歌单名字

desc:歌单描述

tags:歌单tag ,多个用 `;` 隔开,只能用官方规定标签
```

**接口地址 :** `/playlist/update`

**调用例子 :** `/playlist/update?id=24381616&name=新歌单&desc=描述&tags=欧美`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
