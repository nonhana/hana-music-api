---
title: '用户状态 - 支持设置的状态'
description: '登录后调用此接口, 获取支持设置的状态'
---

# 用户状态 - 支持设置的状态

> 登录后调用此接口, 获取支持设置的状态

## 接口信息

| 项目     | 值                            |
| -------- | ----------------------------- |
| 接口地址 | `/user/social/status/support` |
| 请求方式 | `GET` / `POST`                |
| 需要登录 | 是                            |
| 对应模块 | `user_social_status_support`  |
| 文档分类 | 用户与登录                    |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/social/status/support
```

## 编程式调用

```ts
import { userSocialStatusSupport } from 'hana-music-api';

const result = await userSocialStatusSupport();

console.log(result.body);
```

## 返回内容

可设置状态列表在 `data`，每条状态的 `type` 收紧；图标、文案和跳转地址宽松。结构定义和类型是 `UserSocialStatusSupportBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口, 获取支持设置的状态

**接口地址 :** `/user/social/status/support`
