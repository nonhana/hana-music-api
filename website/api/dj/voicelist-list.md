---
title: '播客声音列表'
description: '可以获取播客里的声音'
---

# 播客声音列表

> 可以获取播客里的声音

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/voicelist/list` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `voicelist_list`  |
| 文档分类 | 电台与播客        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voicelist/list
```

## 编程式调用

```ts
import { voicelistList } from 'hana-music-api';

const result = await voicelistList();

console.log(result.body);
```

## 返回内容

工作台接口只允许读取自己的播客。缺少 `voiceListId` 返回 `code: 400`（`参数错误`，`voicelist_list.missing.json`），读取他人的播客返回 `code: 400`（`只允许操作自己的播客`，`voicelist_list.other.json`），不存在的 id 返回 `code: 400`（`播客不存在`，`voicelist_list.unknown.json`）；没有录到带字段的成功正文，SDK 暂不为该模块声明结构定义，`body` 原样返回网易云正文。

## 补充说明

说明: 可以获取播客里的声音

**接口地址:** `/voicelist/list`

**必选参数：**
`voiceListId`: 播客id

返回结果的`displayStatus`参数对应:

```text
AUDITING 审核中
ONLY_SELF_SEE 仅自己可见
ONLINE 已发布
```

**可选参数：**
`limit`: 取出歌单数量，默认为 200

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*200, 其中 200 为 limit 的值
