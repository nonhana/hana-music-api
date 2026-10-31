---
title: '乐谱列表'
description: '调用此接口可以获取歌曲的乐谱列表'
---

# 乐谱列表

> 调用此接口可以获取歌曲的乐谱列表

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/sheet/list`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `sheet_list`   |
| 文档分类 | 其他工具       |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 ID |

## HTTP 示例

```bash
GET /sheet/list?id=1815684465
```

## 编程式调用

```ts
import { sheetList } from 'hana-music-api';

const result = await sheetList({
  id: '1815684465',
});

console.log(result.body);
```

## 返回内容

歌曲的乐谱列表在 `data.musicSheetSimpleInfoVOS`，每份乐谱用 `id`、名称、乐器分类 `type`、封面、难度、调性、版本、BPM 等字段描述。`body.code`、`data.musicSheetSimpleInfoVOS`（可以没有）和每份乐谱自己的编号 `id` 收紧；没有乐谱时网易云把 `musicSheetSimpleInfoVOS` 和 `sheetInstrumentTypeVOList` 都返回 `null`（录制 `sheet_list.empty.json`），缺失或 `null` 照常返回。乐器筛选项 `sheetInstrumentTypeVOList`（可以没有）、`findSheet`、`uploadSheet`、`errorCode` 和乐谱的展示字段全部宽松，出现但坏一条乐谱记录仍会报 502。结构定义和类型是 `SheetListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可以获取歌曲的乐谱列表

**接口地址:** `/sheet/list`

**必选参数:** `id`: 歌曲 ID

**调用例子:** `/sheet/list?id=1815684465`
