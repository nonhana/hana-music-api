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

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /personal/fm/mode
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.personal_fm_mode()

console.log(result.body)
```

## 补充说明

说明: 调用此接口返回私人 FM 内容, 并可以选择模式

**必选参数：**

`mode`: 模式 (aidj, DEFAULT, FAMILIAR, EXPLORE, SCENE_RCMD)

**可选参数：**

`submode`: 当 mode 为 SCENE_RCMD 是可为 ( EXERCISE, FOCUS, NIGHT_EMO )

**接口地址:** `/personal/fm/mode`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
