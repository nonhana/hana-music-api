---
title: '电台排行榜获取'
description: '调用此接口可以获取电台排行榜'
---

# 电台排行榜获取

> 调用此接口可以获取电台排行榜

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/djRadio/top` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `djRadio_top`  |
| 文档分类 | 电台与播客     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /djRadio/top
```

## 编程式调用

```ts
import { djRadioTop } from 'hana-music-api';

const result = await djRadioTop();

console.log(result.body);
```

## 返回内容

`body.code` 收紧，`message` 宽松。`data` 是通到电台作品榜的路径，但本账号的一次登录录制里始终是空数组，元素类型无法确认，没有声明，原样透传。非数字 `djRadioId` 返回 HTTP 400、空正文，网易云把 400 归一成 `status: 200`，结构定义包含空字符串分支，SDK 原样返回 `""`。匿名调用返回 `code: 302`（录制 `djRadio_top.anonymous.json`），SDK 按业务拒绝转交 `status: 302`；本接口需要登录。结构定义和类型是 `DjRadioTopBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可以获取电台排行榜

**接口地址:** `/djRadio/top`

**可选参数：**
`djRadioId` : 电台id

`sortIndex`: 排序 1:播放数 2:点赞数 3：评论数 4：分享数 5：收藏数 默认 1

`dataGapDays`: 天数 7:一周 30:一个月 90:三个月 默认 7

`dataType`: 未知,默认 3
