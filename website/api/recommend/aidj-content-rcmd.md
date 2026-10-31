---
title: '私人 DJ'
description: '调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)'
---

# 私人 DJ

> 调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/aidj/content/rcmd` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `aidj_content_rcmd`  |
| 文档分类 | 推荐与发现           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /aidj/content/rcmd
```

## 编程式调用

```ts
import { aidjContentRcmd } from 'hana-music-api';

const result = await aidjContentRcmd();

console.log(result.body);
```

## 返回内容

`body.data.aiDjResources` 是私人 DJ 资源列表，每条资源的 `type` 和 `value` 是附带的异构载荷，整体宽松；`value` 里声明录制有证据的 `songId`（字符串）、`includeVoice`、`songData`、`songPrivilege`、`audioList`（音频编号、地址、时长等）等字段，全部宽松；`songData` 用模块内的 `AiDjSong`（复用 `ProgramMainSong`，补 `alias`/`transName`/`transNames`，歌曲编号也宽松）。`tagName`、`message`、`trp.rules` 宽松；声明了这些字段，其余原样保留。宽松字段可能缺席，例如 `with-location` 录制里的 song 资源没有 `audioList`。结构定义和类型是 `AidjContentRcmdBody`，见 [返回体结构](/guide/response-bodies)。登录、携带通用坐标和匿名三份录制里，声明过的字段及其允许类型一致；本批没有找到可达的空资源列表，数组本身允许为空。

## 补充说明

说明: 调用此接口可以获取私人 DJ 的推荐内容 (包括 DJ 声音和推荐歌曲)

**接口地址:** `/aidj/content/rcmd`

**可选参数：** `longitude` `latitude` : 当前的经纬度
