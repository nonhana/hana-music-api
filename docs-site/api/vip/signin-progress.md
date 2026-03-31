---
title: "签到进度"
description: "调用此接口 , 可获得签到进度"
---

# 签到进度

> 调用此接口 , 可获得签到进度

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/signin/progress` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `signin_progress` |
| 文档分类 | 会员与云贝 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `moduleId` | string | — | '1207signin-1207signin' | 模块 id，默认为 '1207signin-1207signin' |

## HTTP 示例

```bash
GET /signin/progress?moduleId=1207signin-1207signin
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.signin_progress({
  moduleId: "1207signin-1207signin",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得签到进度

**可选参数 :** `moduleId` : 模块 id，默认为 '1207signin-1207signin'

**接口地址 :** `/signin/progress`

**调用例子 :** `/signin/progress?moduleId=1207signin-1207signin`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
