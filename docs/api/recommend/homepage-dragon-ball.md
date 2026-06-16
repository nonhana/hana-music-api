---
title: '首页-发现-圆形图标入口列表'
description: '调用此接口，可获取 APP 首页圆形图标入口列表'
---

# 首页-发现-圆形图标入口列表

> 调用此接口，可获取 APP 首页圆形图标入口列表

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/homepage/dragon/ball` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `homepage_dragon_ball`  |
| 文档分类 | 推荐与发现              |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /homepage/dragon/ball
```

## 编程式调用

```ts
import { homepageDragonBall } from 'hana-music-api'

const result = await homepageDragonBall()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获取 APP 首页圆形图标入口列表

**接口地址 :** `/homepage/dragon/ball`
