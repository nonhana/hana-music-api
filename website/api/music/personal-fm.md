---
title: '私人 FM'
description: '私人 FM( 需要登录 )'
---

# 私人 FM

> 私人 FM( 需要登录 )

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/personal_fm` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `personal_fm`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /personal_fm
```

## 编程式调用

```ts
import { personalFm } from 'hana-music-api';

const result = await personalFm();

console.log(result.body);
```

## 返回内容

`body.data` 是私人 FM 歌曲列表，歌曲用模块内的 `FmSong`（复用 `ProgramMainSong`，补 `alg`、`alias`、`fmRecReason`、`privilege`、`reason`、`reasonId`、`transName`、`transNames` 等旧版字段），只收紧 `code`、`data` 和每首歌自己的 `id`；`extTransMap` 是以歌曲编号为键的推荐理由映射，`popAdjust` 宽松，`tag` 只见过 `null`，没有声明。`audition`、`crbt`、`mp3Url`、`rtUrl`、`rtUrls`、`rurl`、`sign` 等只见过 `null` 或空数组的字段也未声明，仍原样保留。结构定义和类型是 `PersonalFmBody`，见 [返回体结构](/guide/response-bodies)。登录录制 3 首、匿名录制 1 首，声明过的字段及其允许类型一致；本批没有找到可达的空结果。

## 补充说明

说明 : 私人 FM( 需要登录 )

**接口地址 :** `/personal_fm`

**调用例子 :** `/personal_fm`
