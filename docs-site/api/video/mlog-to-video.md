---
title: "将 mlog id 转为视频 id"
description: "调用此接口 , 传入 mlog id, 可获取 video id，然后通过`video/url` 获取播放地址"
---

# 将 mlog id 转为视频 id

> 调用此接口 , 传入 mlog id, 可获取 video id，然后通过`video/url` 获取播放地址

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/mlog/to/video` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `mlog_to_video` |
| 文档分类 | 视频与 MV |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | mlog id |

## HTTP 示例

```bash
GET /mlog/to/video?id=a1qOVPTWKS1ZrK8
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.mlog_to_video({
  id: "a1qOVPTWKS1ZrK8",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入 mlog id, 可获取 video id，然后通过`video/url` 获取播放地址

**必选参数 :** `id` : mlog id

**接口地址 :** `/mlog/to/video`

**调用例子 :** `/mlog/to/video?id=a1qOVPTWKS1ZrK8`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
