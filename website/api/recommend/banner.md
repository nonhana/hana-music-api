---
title: 'banner'
description: '调用此接口，可获取 banner( 轮播图 ) 数据'
---

# banner

> 调用此接口，可获取 banner( 轮播图 ) 数据

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/banner`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `banner`       |
| 文档分类 | 推荐与发现     |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                                                                |
| ------ | ------ | :--: | ------ | ----------------------------------------------------------------------------------- |
| `type` | string |  —   | 0      | 资源类型,对应以下类型,默认为 0 即 PC<br>0: pc<br>1: android<br>2: iphone<br>3: ipad |

## HTTP 示例

```bash
GET /banner
GET /banner?type=2
```

## 编程式调用

```ts
import { banner } from 'hana-music-api';

const result = await banner();

console.log(result.body);
```

## 返回内容

`body.code` 和通到轮播图列表的 `body.banners` 收紧；`targetId`、`targetType`、`typeTitle`、`url` 和移动端的 `bannerId`、`pic`、`encodeId`、`showAdTag` 等展示与埋点字段宽松，嵌着的歌曲复用宽松的 `LooseSong`。PC 和移动端是两套字段，都按宽松字段放在同一个对象里。本批录制与探测未发现可达的空结果，数组本身允许为空。结构定义和类型是 `BannerBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取 banner( 轮播图 ) 数据

**可选参数 :**

`type`:资源类型,对应以下类型,默认为 0 即 PC

```text
0: pc

1: android

2: iphone

3: ipad
```

**接口地址 :** `/banner`

**调用例子 :** `/banner`, `/banner?type=2`
