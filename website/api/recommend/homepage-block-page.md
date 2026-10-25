---
title: '首页-发现'
description: '调用此接口，可获取 APP 首页信息'
---

# 首页-发现

> 调用此接口，可获取 APP 首页信息

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/homepage/block/page` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `homepage_block_page`  |
| 文档分类 | 推荐与发现             |

## 请求参数

| 参数      | 类型             | 必填 | 默认值 | 说明                      |
| --------- | ---------------- | :--: | ------ | ------------------------- |
| `refresh` | boolean          |  —   | false  | 是否刷新数据,默认为 false |
| `cursor`  | number \| string |  —   | -      | 上一条数据返回的 cursor   |

## HTTP 示例

```bash
GET /homepage/block/page
```

## 编程式调用

```ts
import { homepageBlockPage } from 'hana-music-api';

const result = await homepageBlockPage();

console.log(result.body);
```

## 返回内容

`body.code`、通到首页 block 列表的 `body.data`、`data.blocks` 和每个 block 自己的编号 `data.blocks[].blockCode` 收紧；例如 banner 这类 block 用 `extInfo` 承载内容、没有 `creatives`，所以 `data.blocks[].creatives` 是可以没有的路径，出现时里面的坏元素报 502，`creatives: null` 照常返回。creative 的 `resources` 是宽松数组，整列校验失败时丢弃。`pageConfig`、`cursor`、`hasMore`、block 的 `uiElement`、creative、resource 和 `resourceExtInfo` 都是宽松字段；旧版歌曲复用 `ProgramMainSong`，新歌复用 `LooseSong`，权限复用 `LooseSongPrivilege`，主播复用 `ProgramDj`，创建者和话题用户复用 `PlaylistUser`，嵌着的电台摘要和节目在 `DjProgram` 字段上补了推荐流独有的键。block 的 `extInfo`、`crossPlatformConfig` 等随 block 类型变化的扩展块列没有声明，原样保留；`commentSimpleData` 的 `threadId`、`userName` 在本批录制里只见过 `null`，也没有声明。登录和失效凭据回匿名视角的两份录制都能通过同一结构校验；差异在宽松字段、`creatives` 是否出现（default 的 5 个 block 都有，invalid-cookie 的 banner block 没有）和 block 集合/顺序；不对所有账号/地区/版本作相同性断言。本批录制与探测未发现可达的空 block 列表，`blocks` 数组本身允许为空；非法 `cursor` 上游返回 `code: 50002`，SDK 以 `status: 400` reject 并原样转交正文。录制按字段覆盖保留非连续 block 子集并截取 creative/resource，见各录制的 `context.truncated`。结构定义和类型是 `HomepageBlockPageBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取 APP 首页信息

**接口地址 :** `/homepage/block/page`

**可选参数 :** `refresh`: 是否刷新数据,默认为 false

`cursor`: 上一条数据返回的 cursor
