---
title: "获取 mlog 播放地址"
description: "调用此接口 , 传入 mlog id, 可获取 mlog 播放地址"
---

# 获取 mlog 播放地址

> 调用此接口 , 传入 mlog id, 可获取 mlog 播放地址

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/mlog/url` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `mlog_url` |
| 文档分类 | 视频与 MV |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | mlog id |
| `res` | number \| string | — | 1080 | 分辨率 , 默认为 1080 |

## HTTP 示例

```bash
GET /mlog/url?id=a1qOVPTWKS1ZrK8
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.mlog_url({
  id: "a1qOVPTWKS1ZrK8",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入 mlog id, 可获取 mlog 播放地址

**必选参数 :** `id` : mlog id

**可选参数 :** `res`: 分辨率 , 默认为 1080

**接口地址 :** `/mlog/url`

**调用例子 :** `/mlog/url?id=a1qOVPTWKS1ZrK8`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
