---
title: '曲风偏好'
description: '登录后调用此接口获取我的曲风偏好'
---

# 曲风偏好

> 登录后调用此接口获取我的曲风偏好

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/style/preference` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 是                  |
| 对应模块 | `style_preference`  |
| 文档分类 | 曲风                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /style/preference
```

## 编程式调用

```ts
import { stylePreference } from 'hana-music-api'

const result = await stylePreference()

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口获取我的曲风偏好

**接口地址:** `/style/preference`

**调用例子:** `/style/preference`
