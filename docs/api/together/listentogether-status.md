---
title: '一起听状态'
description: '获取当前登录账号的一起听房间状态、房间信息和成员列表。'
---

# 一起听状态

> 查询当前登录账号是否在一起听房间中，以及房间内的成员信息。

## 接口信息

| 项目     | 值                                |
| -------- | --------------------------------- |
| 接口地址 | `/listentogether/status`          |
| 请求方式 | `GET` / `POST`                    |
| 需要登录 | 是                                |
| 对应模块 | `listentogether_status`           |
| 文档分类 | 一起听                            |
| 上游路径 | `/api/listen/together/status/get` |

## 请求参数

无需业务参数。

## HTTP 示例

```bash
GET /listentogether/status
```

## 编程式调用

```ts
import { listentogetherStatus } from 'hana-music-api'

const result = await listentogetherStatus()

console.log(result.body)
```

## 返回关注点

- `data.inRoom`: 当前账号是否在一起听房间中。
- `data.roomInfo`: 当前房间信息。
- `data.roomInfo.roomUsers`: 房间成员列表；上游示例页会直接用它渲染在线用户头像和昵称。

## 调用场景

- 房主或从机刷新当前房间状态。
- 页面初始化时判断是否需要恢复房间 UI。
- 轮询房间成员变化。

## 补充说明

- 如果 `data.inRoom` 为 `false`，通常意味着需要重新创建房间或重新接受邀请。

## 相关接口

- [`/listentogether/room/create`](/api/together/listentogether-room-create)
- [`/listentogether/accept`](/api/together/listentogether-accept)
- [`/listentogether/end`](/api/together/listentogether-end)
