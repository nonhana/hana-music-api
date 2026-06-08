---
title: '一起听 - 结束房间'
description: '结束当前一起听房间，通常由房主在会话结束时调用。'
---

# 一起听 - 结束房间

> 结束一起听房间并停止后续同步。

## 接口信息

| 项目     | 值                            |
| -------- | ----------------------------- |
| 接口地址 | `/listentogether/end`         |
| 请求方式 | `GET` / `POST`                |
| 需要登录 | 是                            |
| 对应模块 | `listentogether_end`          |
| 文档分类 | 一起听                        |
| 上游路径 | `/api/listen/together/end/v2` |

## 请求参数

| 参数     | 类型   | 必填 | 默认值 | 说明    |
| -------- | ------ | :--: | ------ | ------- |
| `roomId` | string |  ✅  | -      | 房间 ID |

## HTTP 示例

```bash
POST /listentogether/end?roomId=MzA0NjY5...
```

## 编程式调用

```ts
import { listentogetherEnd } from 'hana-music-api'

const result = await listentogetherEnd({
  roomId: 'MzA0NjY5...',
})

console.log(result.body)
```

## 返回关注点

- `code`: 是否调用成功。
- `data.success`: 在上游示例页里用于判断房间是否成功关闭。
- `message`: 失败时的错误原因。

## 调用场景

- 房主结束一起听会话。
- 前端检测到房间无效后执行清理。
- 测试脚本在回收临时房间时执行收尾。。

## 相关接口

- [`/listentogether/status`](/api/together/listentogether-status)
- [`/listentogether/room/check`](/api/together/listentogether-room-check)

## 维护说明

- 本页基于上游 issue、PR 与当前 `hana-music-api` 模块实现补写。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
