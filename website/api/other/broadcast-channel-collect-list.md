---
title: '广播电台 - 我的收藏'
description: '调用此接口, 获取广播电台 - 我的收藏'
---

# 广播电台 - 我的收藏

> 调用此接口, 获取广播电台 - 我的收藏

## 接口信息

| 项目     | 值                                |
| -------- | --------------------------------- |
| 接口地址 | `/broadcast/channel/collect/list` |
| 请求方式 | `GET` / `POST`                    |
| 需要登录 | 否                                |
| 对应模块 | `broadcast_channel_collect_list`  |
| 文档分类 | 其他工具                          |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                   |
| ------- | ---------------- | :--: | ------ | ---------------------- |
| `limit` | number \| string |  —   | 99999  | 返回数量，默认为 99999 |

## HTTP 示例

```bash
GET /broadcast/channel/collect/list
```

## 编程式调用

```ts
import { broadcastChannelCollectList } from 'hana-music-api';

const result = await broadcastChannelCollectList();

console.log(result.body);
```

## 返回内容

只收紧 `body.code`。`data` 在登录和匿名录制里都是空数组（账号没有收藏电台），元素类型没有证据，未声明并原样保留。结构定义和类型是 `BroadcastChannelCollectListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口, 获取广播电台 - 我的收藏

**可选参数 :**

`limit` : 返回数量，默认为 99999

**接口地址:** `/broadcast/channel/collect/list`

**调用例子:** `/broadcast/channel/collect/list`
