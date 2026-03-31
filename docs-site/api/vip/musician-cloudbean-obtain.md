---
title: '领取云豆'
description: '音乐人登录后调用此接口 , 可领取已完成的音乐人任务的云豆奖励'
---

# 领取云豆

> 音乐人登录后调用此接口 , 可领取已完成的音乐人任务的云豆奖励

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/musician/cloudbean/obtain` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 是                           |
| 对应模块 | `musician_cloudbean_obtain`  |
| 文档分类 | 会员与云贝                   |

## 请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明                                                             |
| -------- | ------ | :--: | ------ | ---------------------------------------------------------------- |
| `id`     | string |  ✅  | -      | 任务 id，通过`/musician/tasks`获取到的`userMissionId`即为任务 id |
| `period` | string |  ✅  | -      | 通过`/musician/tasks`获取                                        |

## HTTP 示例

```bash
GET /musician/cloudbean/obtain?id=7036416928&period=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.musician_cloudbean_obtain({
  id: '7036416928',
  period: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 音乐人登录后调用此接口 , 可领取已完成的音乐人任务的云豆奖励

**必选参数 :** `id` : 任务 id，通过`/musician/tasks`获取到的`userMissionId`即为任务 id

`period` : 通过`/musician/tasks`获取

**接口地址 :** `/musician/cloudbean/obtain`

**调用例子 :** `/musician/cloudbean/obtain?id=7036416928&period=1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
