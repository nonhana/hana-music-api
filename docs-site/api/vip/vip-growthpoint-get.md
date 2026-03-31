---
title: '领取 vip 成长值'
description: '登录后调用此接口 , 可获取已完成的会员任务的成长值奖励'
---

# 领取 vip 成长值

> 登录后调用此接口 , 可获取已完成的会员任务的成长值奖励

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/vip/growthpoint/get` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 是                     |
| 对应模块 | `vip_growthpoint_get`  |
| 文档分类 | 会员与云贝             |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明                               |
| ----- | ------ | :--: | ------ | ---------------------------------- |
| `ids` | string |  ✅  | -      | 通过`/vip/tasks`获取到的`unGetIds` |

## HTTP 示例

```bash
GET /vip/growthpoint/get?ids=7043206830_7
GET /vip/growthpoint/get?ids=8613118351_1,8607552957_1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.vip_growthpoint_get({
  ids: '7043206830_7',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可获取已完成的会员任务的成长值奖励

**必选参数 :** `ids` : 通过`/vip/tasks`获取到的`unGetIds`

**接口地址 :** `/vip/growthpoint/get`

**调用例子 :** `/vip/growthpoint/get?ids=7043206830_7` `/vip/growthpoint/get?ids=8613118351_1,8607552957_1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
