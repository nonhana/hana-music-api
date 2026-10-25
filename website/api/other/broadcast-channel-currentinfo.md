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
import { broadcastChannelCurrentinfo } from 'hana-music-api';

const result = await broadcastChannelCurrentinfo({
  id: '5',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到频道当前信息的 `body.data`、频道自己的编号 `data.id` 和播放地址 `data.playUrl` 收紧；节目与展示字段宽松。空闲频道的 `programId`/`startTime`/`endTime`/`duration` 是 `0`，`programName`、`thirdProgramId` 是 `null`；正在播出的频道有节目编号和起止时间。`broadcaster` 只见过 `null` 和空数组，未声明。已下架/无当前信息的频道返回 HTTP 200、正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`（录制 `broadcast_channel_currentinfo.delisted.json`）。结构定义和类型是 `BroadcastChannelCurrentinfoBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口, 传入电台id, 获取广播电台 - 电台信息

**必选参数：**

`id`: 电台id

**接口地址:** `/broadcast/channel/currentinfo`

**调用例子:** `/broadcast/channel/currentinfo?id=5`
