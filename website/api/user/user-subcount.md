---
title: '获取用户信息，歌单，收藏，mv, dj 数量'
description: '登录后调用此接口，可以获取用户信息'
---

# 获取用户信息，歌单，收藏，mv, dj 数量

> 登录后调用此接口，可以获取用户信息

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/user/subcount` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `user_subcount`  |
| 文档分类 | 用户与登录       |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/subcount
```

## 编程式调用

```ts
import { userSubcount } from 'hana-music-api';

const result = await userSubcount();

console.log(result.body);
```

## 返回内容

正文是各项收藏计数（`programCount`、`djRadioCount`、`mvCount`、`artistCount`、`newProgramCount`、`createDjRadioCount`、`createdPlaylistCount`、`subPlaylistCount`）。只有 `code` 收紧，计数全部宽松：缺一项只是少一项信息，不会 502。结构定义和类型是 `UserSubcountBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可以获取用户信息

**接口地址 :** `/user/subcount`

**调用例子 :** `/user/subcount`
