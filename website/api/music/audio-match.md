---
title: '听歌识曲'
description: '使用此接口,上传音频文件或者麦克风采集声音可识别对应歌曲信息,具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)'
---

# 听歌识曲

> 使用此接口,上传音频文件或者麦克风采集声音可识别对应歌曲信息,具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/audio/match` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `audio_match`  |
| 文档分类 | 歌曲与播放     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /audio/match
```

## 编程式调用

```ts
import { audioMatch } from 'hana-music-api';

const result = await audioMatch();

console.log(result.body);
```

## 返回内容

`body` 是网易云原文：`code` 和识别结果路径 `data` 收紧；`data.result` 可以没有（没识别到时是 `null`），出现时每条记录的 `song` 按歌曲声明校验，`song.id` 收紧。`data.queryId`、`data.type`、`data.moduleList`、`data.noMatchReason`、`startTime` 等宽松；只见过 `null` 的 `data.mv` 没有声明，原样保留。

- 有命中：`data.result` 是匹配列表，每项带 `startTime` 和 `song`（`song.id`、`song.name`、歌手和专辑等）。
- 没有命中：`data.result` 是 `null`，`data.noMatchReason` 给出原因（本次录制是 10）。
- 上游返回码不是 200 时按业务拒绝原样转交，`status` 取返回码。

这是普通 GET，`audioFP` 由浏览器音频运行时按 8 kHz/3 秒的流程生成；录制里的 `query.audioFP` 可以原样复用。仓库脚本可以复现这两种指纹：`bun scripts/audio-fingerprint.mts <音频文件> --offset 1`（有命中，源歌曲《平凡之路》 id 28815250，源 FLAC 从登录态播放地址取得，偏移 1 秒取 3 秒；匿名播放地址是 30 秒试听 MP3，未用于该指纹）和 `bun scripts/audio-fingerprint.mts --tone 440`（无命中）。登录和匿名录制的字段集合相同，`queryId` 等动态值不同。未声明的顶层字段原样保留。结构定义和类型是 `AudioMatchBody`，见 [返回体结构](/guide/response-bodies#播放)。

## 补充说明

说明: 使用此接口,上传音频文件或者麦克风采集声音可识别对应歌曲信息,具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)

**接口地址:** `/audio/match`

**必选参数：**

`duration`: 音频时长,单位秒

`audioFP`: 音频指纹,参考项目调用例子获取
