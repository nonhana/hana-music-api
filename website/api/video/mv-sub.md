---
title: '收藏/取消收藏 MV'
description: '调用此接口,可收藏/取消收藏 MV'
---

# 收藏/取消收藏 MV

> 调用此接口,可收藏/取消收藏 MV

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/sub`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_sub`       |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                    |
| ------ | ------ | :--: | ------ | ----------------------- |
| `mvid` | string |  ✅  | -      | MV id                   |
| `t`    | string |  ✅  | -      | 1 为收藏,其他为取消收藏 |

## HTTP 示例

```bash
GET /mv/sub
```

## 编程式调用

```ts
import { mvSub } from 'hana-music-api';

const result = await mvSub({
  mvid: '123456',
  t: 'your-t',
});

console.log(result.body);
```

## 返回内容

`body.code` 是接口要拿的操作结果，收紧为 `200`；`message` 是附带的提示，宽松，`data` 只见过 `null` 未声明。已收藏时再收藏仍回 `code: 200`。结构定义和类型是 `MvSubBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可收藏/取消收藏 MV

**必选参数 :**

`mvid` : MV id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/mv/sub`

**调用例子 :** `/mv/sub`
