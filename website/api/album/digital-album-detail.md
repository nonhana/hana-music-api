---
title: '数字专辑详情'
description: '调用此接口，传入专辑 id, 可获取数字专辑信息'
---

# 数字专辑详情

> 调用此接口，传入专辑 id, 可获取数字专辑信息

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/digitalAlbum/detail` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `digitalAlbum_detail`  |
| 文档分类 | 专辑                   |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 专辑 id |

## HTTP 示例

```bash
GET /digitalAlbum/detail?id=120605500
```

## 编程式调用

```ts
import { digitalAlbumDetail } from 'hana-music-api';

const result = await digitalAlbumDetail({
  id: '120605500',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.album`、`body.album.albumId` 和 `body.product` 收紧。这个模块与[专辑内容](/api/album/album-detail)共用同一个上游详情接口和 `AlbumDetailBody`；`body.product` 里的价格、简介和 `extInfo`，以及 `body.board`、`canBuy`、`hasAlbum`、`boughtCnt`、`vipType`、`visitorId` 都是宽松字段。未知 id 返回 `code: 404`，SDK 按业务拒绝原样转交，不会报 502。登录对照只做了探针观察，未保留对照录制，不对公开结构作相同性断言。输入仍是 legacy，不做 id 本地校验。结构定义和类型是 `DigitalAlbumDetailBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入专辑 id, 可获取数字专辑信息

**必选参数 :** `id` : 专辑 id

**接口地址 :** `/digitalAlbum/detail`

**调用例子 :** `/digitalAlbum/detail?id=120605500`
