---
title: '内部版本接口'
description: '调用此接口 , 可获得内部版本号(从package.json读取)'
---

# 内部版本接口

> 调用此接口 , 可获得内部版本号(从package.json读取)

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/inner/version` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `inner_version`  |
| 文档分类 | 其他工具         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /inner/version
```

## 编程式调用

```ts
import { innerVersion } from 'hana-music-api'

const result = await innerVersion()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得内部版本号(从package.json读取)

**接口地址 :** `/inner/version`

**调用例子 :** `/inner/version`
