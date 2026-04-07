---
title: '首页-发现-圆形图标入口列表'
description: '调用此接口 , 可获取 APP 首页圆形图标入口列表'
---

# 首页-发现-圆形图标入口列表

> 调用此接口 , 可获取 APP 首页圆形图标入口列表

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/homepage/dragon/ball` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `homepage_dragon_ball`  |
| 文档分类 | 推荐与发现              |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /homepage/dragon/ball
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.homepage_dragon_ball()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取 APP 首页圆形图标入口列表

**接口地址 :** `/homepage/dragon/ball`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
