---
title: '数字专辑详情'
description: '调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)'
---

# 数字专辑详情

> 调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/album/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `album_detail`  |
| 文档分类 | 专辑            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /album/detail?id=84547195
```

## 编程式调用

```ts
import { albumDetail } from 'hana-music-api';

const result = await albumDetail({
  id: '84547195',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.album`、`body.album.albumId` 和 `body.product` 收紧：这是数字专辑商品详情，不是普通专辑，`body.album` 用的是 `albumId`、`albumName`、`artistName`，没有 `AlbumSummary` 里的 `id` 和 `songs`。`body.product` 里的价格、售卖数量、简介和 `extInfo` 都是宽松字段；`body.board`、`canBuy`、`hasAlbum`、`boughtCnt`、`vipType`、`visitorId` 也宽松，可能缺失或是 `null`。非数字专辑（录制 `album_detail.non-digital.json`）或未知 id 会返回 `code: 404`（`无专辑商品`），SDK 按业务拒绝原样转交，不会报 502；本批录制与探测未发现可达的空结果。登录后 `vipType`、`visitorId` 会变化，登录对照录制保留在 `album_detail.default-vip.json`。结构定义和类型是 `AlbumDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口 ,传入数字专辑 id 可获取数字专辑详情(和歌单详情有差异)

**接口地址 :** `/album/detail`

**调用例子 :** `/album/detail?id=84547195`
