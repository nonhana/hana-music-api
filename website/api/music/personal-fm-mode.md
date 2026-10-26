---
title: '私人 FM 模式选择'
description: '调用此接口返回私人 FM 内容, 并可以选择模式'
---

# 私人 FM 模式选择

> 调用此接口返回私人 FM 内容, 并可以选择模式

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/personal/fm/mode` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `personal_fm_mode`  |
| 文档分类 | 歌曲与播放          |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /personal/fm/mode
```

## 编程式调用

```ts
import { personalFmMode } from 'hana-music-api';

const result = await personalFmMode();

console.log(result.body);
```

## 返回内容

`body.data` 是所选模式的私人 FM 歌曲列表，歌曲用模块内的 `FmSong`（复用 `ProgramMainSong`，补 `alg`、`alias`、`fmRecReason`、`privilege`、`reason`、`reasonId`、`transName`、`transNames` 等旧版字段），只收紧 `code`、`data` 和每首歌自己的 `id`；`extTransMap` 是以歌曲编号为键、`fmRecReason` 为值的宽松映射，`popAdjust` 宽松，`tag` 只见过 `null`，没有声明。结构定义和类型是 `PersonalFmModeBody`，见 [返回体结构](/guide/response-bodies)。`mode`/`submode` 只改请求参数，响应与 `personal_fm` 同构。录制覆盖 `DEFAULT`、`FAMILIAR`、`EXPLORE`、`aidj` 和 `SCENE_RCMD` 的 `FOCUS`/`EXERCISE`/`NIGHT_EMO`，另有匿名对照；声明过的字段及其允许类型一致，本批没有找到可达的空结果。

## 补充说明

说明: 调用此接口返回私人 FM 内容, 并可以选择模式

**必选参数：**

`mode`: 模式 (aidj, DEFAULT, FAMILIAR, EXPLORE, SCENE_RCMD)

**可选参数：**

`submode`: 当 mode 为 SCENE_RCMD 是可为 ( EXERCISE, FOCUS, NIGHT_EMO )

**接口地址:** `/personal/fm/mode`
