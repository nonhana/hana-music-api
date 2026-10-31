---
title: '电台 - 节目详情'
description: '调用此接口传入电台节目 id,可获得电台节目详情'
---

# 电台 - 节目详情

> 调用此接口传入电台节目 id,可获得电台节目详情

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/dj/program/detail` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `dj_program_detail`  |
| 文档分类 | 电台与播客           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明           |
| ---- | ------ | :--: | ------ | -------------- |
| `id` | string |  ✅  | -      | 电台节目 的 id |

## HTTP 示例

```bash
GET /dj/program/detail?id=1367665101
```

## 编程式调用

```ts
import { djProgramDetail } from 'hana-music-api';

const result = await djProgramDetail({
  id: '1367665101',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到节目详情的 `body.program` 和节目自己的编号 `program.id` 收紧，其余字段按 `DjProgram` 宽松校验（`mainSong`、`dj`、`radio` 和已声明的展示字段，未声明字段原样保留为 JSON）。`participateAnchors` 的非空证据来自节目 3729504614（录制 `dj_program_detail.anchors.json`，2 个参与主播），元素只声明 `userId`、`type` 和 `anchorInfo`，`role`、`basicDivide`、`personalBuyLink`、`personalDivide` 只见过 `null`，没有声明。同一份录制里 `programDesc` 是 28 个简介图文条目（`content` 非空），`specialTags` 是字符串数组（本录制里有一个元素），都已声明为宽松字段。`songs` 和 `programGuests` 在本批录制与探测的节目中未发现非空，元素结构未知，没有声明。未知节目 id 返回 HTTP 200、正文 `code: 404`（录制 `dj_program_detail.unknown.json`），SDK 按业务拒绝转交 `status: 404`，正文仍是网易云原文。

## 补充说明

说明 : 调用此接口传入电台节目 id,可获得电台节目详情

**必选参数 :** `id`: 电台节目 的 id

**接口地址 :** `/dj/program/detail`

**调用例子 :** `/dj/program/detail?id=1367665101`
