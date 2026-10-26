---
title: '云盘歌曲信息匹配纠正'
description: '登录后调用此接口,可对云盘歌曲信息匹配纠正,如需取消匹配,asid 需要传 0'
---

# 云盘歌曲信息匹配纠正

> 登录后调用此接口,可对云盘歌曲信息匹配纠正,如需取消匹配,asid 需要传 0

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/cloud/match` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `cloud_match`  |
| 文档分类 | 云盘与上传     |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明            |
| ------ | ------ | :--: | ------ | --------------- |
| `uid`  | string |  ✅  | -      | 用户 id         |
| `sid`  | string |  ✅  | -      | 云盘的歌曲 id   |
| `asid` | string |  ✅  | -      | 要匹配的歌曲 id |

## HTTP 示例

```bash
GET /cloud/match?uid=32953014&sid=aaa&asid=bbb
GET /cloud/match?uid=32953014&sid=bbb&asid=0
```

## 编程式调用

```ts
import { cloudMatch } from 'hana-music-api';

const result = await cloudMatch({
  uid: '32953014',
  sid: 'aaa',
  asid: 'bbb',
});

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`；匹配后的云盘记录 `body.matchData` 和这条记录自己的 `matchData.songId` 收紧（匹配后 `songId` 变成纠错目标），`matchData` 的其余字段宽松，内嵌歌曲复用 `LooseSong`；`message` 在成功正文里是数字 `200`，`data` 是布尔成功标记，都宽松。`asid` 不是有效曲库歌曲时上游返回 `code: 400` 且没有 `matchData`（录制 `cloud_match.invalid-asid.json`）：改造前是 resolve `status: 200`、正文 `code: 400`，现在按业务拒绝 reject `status: 400`、`body` 保留原文。结构定义和类型是 `CloudMatchBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口,可对云盘歌曲信息匹配纠正,如需取消匹配,asid 需要传 0

**必选参数 :**  
`uid`: 用户 id

`sid`: 云盘的歌曲 id

`asid`: 要匹配的歌曲 id

**接口地址 :** `/cloud/match`

**调用例子 :** `/cloud/match?uid=32953014&sid=aaa&asid=bbb` `/cloud/match?uid=32953014&sid=bbb&asid=0`
