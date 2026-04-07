---
title: '云盘歌曲删除'
description: '登录后调用此接口 , 可删除云盘歌曲'
---

# 云盘歌曲删除

> 登录后调用此接口 , 可删除云盘歌曲

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/user/cloud/del` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `user_cloud_del`  |
| 文档分类 | 云盘与上传        |

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                      |
| ---- | ------------------ | :--: | ------ | ------------------------- |
| `id` | string[] \| string |  ✅  | -      | 歌曲 id,可多个,用逗号隔开 |

## HTTP 示例

```bash
GET /user/cloud/del
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_cloud_del({
  id: '123456',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可删除云盘歌曲

**必选参数 :** `id`: 歌曲 id,可多个,用逗号隔开

**接口地址 :** `/user/cloud/del`

**调用例子 :** `/user/cloud/del`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
