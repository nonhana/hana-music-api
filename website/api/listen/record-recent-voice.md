---
title: '最近播放-声音'
description: '调用此接口，可获得最近播放-声音'
---

# 最近播放-声音

> 调用此接口，可获得最近播放-声音

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/record/recent/voice` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `record_recent_voice`  |
| 文档分类 | 听歌记录               |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                 |
| ------- | ---------------- | :--: | ------ | -------------------- |
| `limit` | number \| string |  —   | 100    | 返回数量，默认为 100 |

## HTTP 示例

```bash
GET /record/recent/voice?limit=1
```

## 编程式调用

```ts
import { recordRecentVoice } from 'hana-music-api';

const result = await recordRecentVoice({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data`、`body.data.list` 和每条记录的 `resourceId`（字符串）、节目 `data.pubDJProgramData.id` 收紧；`pubDJProgramData` 复用 `DjProgram` 并补上最近播放列表额外返回的统计和分类字段，其余节目字段、`commentCount`、`playTime`、`resourceType`、`total`、`message` 宽松。`limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`、`body: ''`，结构定义保留这个空字符串分支。结构定义和类型是 `RecordRecentVoiceBody`，见 [返回体结构](/guide/response-bodies)。匿名调用返回 `total: 0`、`list: []`（录制 `record_recent_voice.anonymous.json`），作为真实空结果；登录录制见 `record_recent_voice.default.json`。

## 补充说明

说明 : 调用此接口，可获得最近播放-声音

**可选参数 :** `limit` : 返回数量，默认为 100

**接口地址 :** `/record/recent/voice`

**调用例子 :** `/record/recent/voice?limit=1`
