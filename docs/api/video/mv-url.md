---
title: 'mv 地址'
description: '调用此接口 , 传入 mv id,可获取 mv 播放地址'
---

# mv 地址

> 调用此接口 , 传入 mv id,可获取 mv 播放地址

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/url`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_url`       |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                                                  |
| ---- | ------------------ | :--: | ------ | ----------------------------------------------------- |
| `id` | string             |  ✅  | -      | mv id                                                 |
| `r`  | string[] \| string |  —   | 1080   | 分辨率,默认 1080,可从 `/mv/detail` 接口获取分辨率列表 |

## HTTP 示例

```bash
GET /mv/url?id=5436712
GET /mv/url?id=10896407&r=1080
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.mv_url({
  id: '5436712',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入 mv id,可获取 mv 播放地址

**必选参数 :** `id`: mv id

**可选参数 :** `r`: 分辨率,默认 1080,可从 `/mv/detail` 接口获取分辨率列表

**接口地址 :** `/mv/url`

**调用例子 :**

`/mv/url?id=5436712` `/mv/url?id=10896407&r=1080`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
