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

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /audio/match
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.audio_match()

console.log(result.body)
```

## 补充说明

说明: 使用此接口,上传音频文件或者麦克风采集声音可识别对应歌曲信息,具体调用例子参考 `/audio_match_demo/index.html` (项目文件: `public/audio_match_demo/index.html`)

**接口地址:** `/audio/match`

**必选参数：**

`duration`: 音频时长,单位秒

`audioFP`: 音频指纹,参考项目调用例子获取

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
