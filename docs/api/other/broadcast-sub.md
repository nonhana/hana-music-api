---
title: '广播电台 - 收藏/取消收藏电台'
description: '收藏或取消收藏广播电台。'
---

# 广播电台 - 收藏/取消收藏电台

> 收藏或取消收藏广播电台。

## 接口信息

| 项目     | 值                              |
| -------- | ------------------------------- |
| 接口地址 | `/broadcast/sub`                |
| 请求方式 | `GET` / `POST`                  |
| 需要登录 | 是                              |
| 对应模块 | `broadcast_sub`                 |
| 文档分类 | 其他工具                        |
| 上游路径 | `/api/content/interact/collect` |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                                   |
| ---- | ------ | :--: | ------ | -------------------------------------- |
| `id` | string |  ✅  | -      | 广播电台 ID                            |
| `t`  | number |  ✅  | -      | 操作类型，`1` 为收藏，其他值为取消收藏 |

## HTTP 示例

```bash
GET /broadcast/sub?id=5&t=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.broadcast_sub({
  id: '5',
  t: 1,
})

console.log(result.body)
```

## 返回关注点

- `code`: 请求是否成功。
- `message`: 失败时的错误原因。

## 维护说明

- 本页依据历史 `home.md` 和当前迁移实现补写。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
