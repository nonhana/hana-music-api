---
title: '广播电台 - 电台信息'
description: '调用此接口, 传入电台id, 获取广播电台 - 电台信息'
---

# 广播电台 - 电台信息

> 调用此接口, 传入电台id, 获取广播电台 - 电台信息

## 接口信息

| 项目     | 值                               |
| -------- | -------------------------------- |
| 接口地址 | `/broadcast/channel/currentinfo` |
| 请求方式 | `GET` / `POST`                   |
| 需要登录 | 否                               |
| 对应模块 | `broadcast_channel_currentinfo`  |
| 文档分类 | 其他工具                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /broadcast/channel/currentinfo?id=5
```

## 编程式调用

```ts
import { broadcastChannelCurrentinfo } from 'hana-music-api'

const result = await broadcastChannelCurrentinfo({
  id: '5',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 传入电台id, 获取广播电台 - 电台信息

**必选参数：**

`id`: 电台id

**接口地址:** `/broadcast/channel/currentinfo`

**调用例子:** `/broadcast/channel/currentinfo?id=5`
