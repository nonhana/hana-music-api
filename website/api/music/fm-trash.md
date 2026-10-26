---
title: '垃圾桶'
description: '调用此接口，传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶'
---

# 垃圾桶

> 调用此接口，传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/fm_trash`    |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `fm_trash`     |
| 文档分类 | 歌曲与播放     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /fm_trash?id=347230
```

## 编程式调用

```ts
import { fmTrash } from 'hana-music-api';

const result = await fmTrash({
  id: '347230',
});

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`；`count` 是附带计数，宽松；`songs` 在录制里只出现过空数组，元素类型没有证据，未声明并原样保留。这个写入把歌曲移入私人 FM 的垃圾桶，接口没有撤销调用（录制 `fm_trash.trash.json`）。结构定义和类型是 `FmTrashBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/fm_trash`

**调用例子 :** `/fm_trash?id=347230`
