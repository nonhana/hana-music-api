---
title: '我的数字专辑'
description: '登录后调用此接口 ,可获取我的数字专辑'
---

# 我的数字专辑

> 登录后调用此接口 ,可获取我的数字专辑

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/digitalAlbum/purchased` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 是                        |
| 对应模块 | `digitalAlbum_purchased`  |
| 文档分类 | 专辑                      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /digitalAlbum/purchased?limit=10
```

## 编程式调用

```ts
import { digitalAlbumPurchased } from 'hana-music-api';

const result = await digitalAlbumPurchased({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧。录制账号没有购买记录，`paidAlbums` 只有空数组证据、元素类型未知，未声明，按未声明字段原样保留；`total` 是宽松字段。没有另一个已购买账号可补录非空 `paidAlbums`。匿名与登录调用都返回空的 `paidAlbums`，列表为空时 `offset=100000` 仍为空（录制 `digital-album/digitalAlbum_purchased.offset-100000.json`；匿名对照 `digital-album/digitalAlbum_purchased.anonymous.json`）。结构定义和类型是 `DigitalAlbumPurchasedBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口 ,可获取我的数字专辑

**接口地址 :** `/digitalAlbum/purchased`

**调用例子 :** `/digitalAlbum/purchased?limit=10`
