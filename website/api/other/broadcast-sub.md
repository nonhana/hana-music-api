---
title: '广播电台 - 收藏/取消收藏电台'
description: '收藏或取消收藏广播电台。'
---

# 广播电台 - 收藏/取消收藏电台

> 收藏或取消收藏广播电台。

## 接口信息

| 项目     | 值                              |
| -------- | ------------------------------- |
| 接口地址 | `/broadcast/sub`                |
| 请求方式 | `GET` / `POST`                  |
| 需要登录 | 是                              |
| 对应模块 | `broadcast_sub`                 |
| 文档分类 | 其他工具                        |
| 上游路径 | `/api/content/interact/collect` |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明                                   |
| ---- | ------ | :--: | ------ | -------------------------------------- |
| `id` | string |  ✅  | -      | 广播电台 ID                            |
| `t`  | number |  ✅  | -      | 操作类型，`1` 为收藏，其他值为取消收藏 |

## HTTP 示例

```bash
GET /broadcast/sub?id=5&t=1
```

## 编程式调用

```ts
import { broadcastSub } from 'hana-music-api';

const result = await broadcastSub({
  id: '5',
  t: 1,
});

console.log(result.body);
```

## 返回内容

`body.code` 是接口要拿的操作结果，收紧为 `200`；`data` 是操作结果标志、`message` 是提示，宽松。收藏、已收藏再收藏和取消收藏都回 `{ code: 200, data: true, message: "" }`。结构定义和类型是 `BroadcastSubBody`，见 [返回体结构](/guide/response-bodies)。
