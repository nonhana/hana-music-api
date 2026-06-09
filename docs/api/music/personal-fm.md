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
import { personalFm } from 'hana-music-api'

const result = await personalFm()

console.log(result.body)
```

## 补充说明

说明 : 私人 FM( 需要登录 )

**接口地址 :** `/personal_fm`

**调用例子 :** `/personal_fm`
