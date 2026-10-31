---
title: '心动模式/智能播放'
description: '登录后调用此接口，可获取心动模式/智能播放列表'
---

# 心动模式/智能播放

> 登录后调用此接口，可获取心动模式/智能播放列表

## 接口信息

| 项目     | 值                            |
| -------- | ----------------------------- |
| 接口地址 | `/playmode/intelligence/list` |
| 请求方式 | `GET` / `POST`                |
| 需要登录 | 是                            |
| 对应模块 | `playmode_intelligence_list`  |
| 文档分类 | 推荐与发现                    |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明                  |
| ----- | ------ | :--: | ------ | --------------------- |
| `id`  | string |  ✅  | -      | 歌曲 id               |
| `pid` | string |  ✅  | -      | 歌单 id               |
| `sid` | string |  —   | -      | 要开始播放的歌曲的 id |

## HTTP 示例

```bash
GET /playmode/intelligence/list?id=33894312&pid=24381616
GET /playmode/intelligence/list?id=33894312&pid=24381616&sid=36871368
```

## 编程式调用

```ts
import { playmodeIntelligenceList } from 'hana-music-api';

const result = await playmodeIntelligenceList({
  id: '33894312',
  pid: '24381616',
});

console.log(result.body);
```

## 返回内容

`body.data` 是心动模式列表，每条记录自己的 `id` 收紧，`songInfo` 是宽松字段并复用 `LooseSong`（嵌套歌曲编号也宽松，坏 `id` 只丢编号，不会让整条 `songInfo` 消失）；`alg`、`recommended`、`message` 宽松。结构定义和类型是 `PlaymodeIntelligenceListBody`，见 [返回体结构](/guide/response-bodies)。录制从原始 149 条截到 3 条（`context.truncated` 记录原始长度）；缺少 `pid` 或探测到的另一个歌单时，SDK 按上游业务码转交，不报 502。本批没有找到可达的空 `data`，数组本身允许为空。

## 补充说明

说明 : 登录后调用此接口，可获取心动模式/智能播放列表
**必选参数 :** `id` : 歌曲 id

`pid` : 歌单 id

**可选参数 :**
`sid` : 要开始播放的歌曲的 id

**接口地址 :** `/playmode/intelligence/list`

**调用例子 :** `/playmode/intelligence/list?id=33894312&pid=24381616`，`/playmode/intelligence/list?id=33894312&pid=24381616&sid=36871368`
