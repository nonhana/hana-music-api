---
title: 'DIFM电台 - 收藏频道'
description: '调用此接口, 可收藏DIFM频道'
---

# DIFM电台 - 收藏频道

> 调用此接口, 可收藏DIFM频道

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/dj/difm/channel/subscribe` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `dj_difm_channel_subscribe`  |
| 文档分类 | 电台与播客                   |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明   |
| ---- | ------ | :--: | ------ | ------ |
| `id` | string |  ✅  | -      | 频道id |

## HTTP 示例

```bash
GET /dj/difm/channel/subscribe?id=1
```

## 编程式调用

```ts
import { djDifmChannelSubscribe } from 'hana-music-api';

const result = await djDifmChannelSubscribe({
  id: '1',
});

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`；`message` 是附带的提示，宽松。`data` 在订阅与取消的录制里都只有空对象，内部字段没有证据，未声明并原样保留。录制覆盖清空后重新订阅（`dj_difm_channel_subscribe.subscribe-again.json`，写前回读为空数组、写后回读含 10505）；已订阅时重复订阅的幂等分支未录制。结构定义和类型是 `DjDifmChannelSubscribeBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口, 可收藏DIFM频道

**必选参数 :**

`id`: 频道id

**接口地址:** `/dj/difm/channel/subscribe`

**调用例子:** `/dj/difm/channel/subscribe?id=1`
