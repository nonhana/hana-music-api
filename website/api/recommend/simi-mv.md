---
title: '相似 mv'
description: '调用此接口，传入 `mvid` 可获取相似 mv'
---

# 相似 mv

> 调用此接口，传入 `mvid` 可获取相似 mv

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/simi/mv`     |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `simi_mv`      |
| 文档分类 | 推荐与发现     |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明  |
| ------ | ------ | :--: | ------ | ----- |
| `mvid` | string |  ✅  | -      | mv id |

## HTTP 示例

```bash
GET /simi/mv?mvid=5436712
```

## 编程式调用

```ts
import { simiMv } from 'hana-music-api';

const result = await simiMv({
  mvid: '5436712',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.mvs` 和每个 MV 的 `body.mvs[].id` 收紧；MV 记录复用 `MvSummary`，`cover`、`name`、`playCount`、`duration`、`mark`、`artistId`、`artistName`、`artists`（宽松的 `Artist`）等宽松，`desc` 只见过 `null` 没有声明，`alg` 是宽松字段。传入未知 `mvid` 仍返回默认 5 条（`simi_mv.unknown-mvid.json`），本批录制与探测未发现可达的空结果，`mvs` 数组本身允许为空。本页录制来自登录账号（`context.viewer` 是 `authenticated`），没有保留匿名对照录制。

## 补充说明

说明 : 调用此接口，传入 `mvid` 可获取相似 mv

**必选参数 :** `mvid`: mv id

**接口地址 :** `/simi/mv`

**调用例子 :** `/simi/mv?mvid=5436712`
