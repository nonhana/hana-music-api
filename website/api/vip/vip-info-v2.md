---
title: '获取 VIP 信息(app端)'
description: '登录后调用此接口，可获取当前 VIP 信息。'
---

# 获取 VIP 信息(app端)

> 登录后调用此接口，可获取当前 VIP 信息。

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/vip/info/v2` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `vip_info_v2`  |
| 文档分类 | 会员与云贝     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  —   | -      | 用户 id |

## HTTP 示例

```bash
GET /vip/info/v2
GET /vip/info/v2?uid=32953014
```

## 编程式调用

```ts
import { vipInfoV2 } from 'hana-music-api';

const result = await vipInfoV2();

console.log(result.body);
```

## 返回内容

正文带 `code`、`data` 和 `message`。只有 `code`、`data` 收紧；`data` 里的会员权益对象（如 `associator`、`musicPackage`、`redplus`）和 `message` 都是宽松字段。结构定义和类型是 `VipInfoV2Body`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 登录后调用此接口，可获取当前 VIP 信息。

**可选参数 :** `uid` : 用户 id

**接口地址 :** `/vip/info/v2`

**调用例子 :** `/vip/info/v2`, `/vip/info/v2?uid=32953014`
