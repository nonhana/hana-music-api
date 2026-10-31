---
title: '乐谱内容'
description: '调用此接口获取乐谱的内容'
---

# 乐谱内容

> 调用此接口获取乐谱的内容

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/sheet/preview` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `sheet_preview`  |
| 文档分类 | 其他工具         |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明        |
| ---- | ------ | :--: | ------ | ----------- |
| `id` | string |  ✅  | -      | **乐谱** ID |

## HTTP 示例

```bash
GET /sheet/preview?id=143190
```

## 编程式调用

```ts
import { sheetPreview } from 'hana-music-api';

const result = await sheetPreview({
  id: '143190',
});

console.log(result.body);
```

## 返回内容

乐谱内容在 `data`，按页给出 `id`、`sheetId`、图片地址 `url`、`md5`、页码和大小。`body.code`、`data`、每页自己的编号 `id` 和取图地址 `url` 收紧；不存在的乐谱返回空数组（录制 `sheet_preview.empty.json`），数组本身允许为空。`sheetId`、`md5`、`pageNumber`、`size` 宽松。匿名调用同样返回 6 页（录制 `sheet_preview.anonymous.json`）。结构定义和类型是 `SheetPreviewBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口获取乐谱的内容

**接口地址:** `/sheet/preview`

**必选参数:** `id`: **乐谱** ID

**调用例子:** `/sheet/preview?id=143190`
