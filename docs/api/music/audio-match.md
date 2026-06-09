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
import { audioMatch } from 'hana-music-api'

const result = await audioMatch()

console.log(result.body)
```

## 补充说明

说明: 使用此接口,上传音频文件或者麦克风采集声音可识别对应歌曲信息,具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)

**接口地址:** `/audio/match`

**必选参数：**

`duration`: 音频时长,单位秒

`audioFP`: 音频指纹,参考项目调用例子获取
