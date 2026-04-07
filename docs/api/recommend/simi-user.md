---
title: '获取最近 5 个听了这首歌的用户'
description: '调用此接口 , 传入歌曲 id, 最近 5 个听了这首歌的用户'
---

# 获取最近 5 个听了这首歌的用户

> 调用此接口 , 传入歌曲 id, 最近 5 个听了这首歌的用户

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/simi/user`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `simi_user`    |
| 文档分类 | 推荐与发现     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /simi/user?id=347230
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.simi_user({
  id: '347230',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌曲 id, 最近 5 个听了这首歌的用户

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/simi/user`

**调用例子 :** `/simi/user?id=347230` ( 对应 ' 光辉岁月 ' 相似歌曲 )

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
