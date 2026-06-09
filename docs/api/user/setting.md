---
title: '设置'
description: '登录后调用此接口 ,可获取用户设置'
---

# 设置

> 登录后调用此接口 ,可获取用户设置

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/setting`     |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `setting`      |
| 文档分类 | 用户与登录     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /setting
```

## 编程式调用

```ts
import { setting } from 'hana-music-api'

const result = await setting()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取用户设置

**接口地址 :** `/setting`

**调用例子 :** `/setting`
