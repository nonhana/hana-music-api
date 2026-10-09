---
title: '登录状态'
description: '调用此接口,可获取登录状态'
---

# 登录状态

> 调用此接口,可获取登录状态

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/login/status` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `login_status`  |
| 文档分类 | 用户与登录      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /login/status
```

## 编程式调用

```ts
import { loginStatus } from 'hana-music-api';

const result = await loginStatus();

console.log(result.body);
```

## 返回内容

正文是 `{ "data": … }`，`data` 里与 [获取账号信息](/api/user/user-account) 的正文结构相同。结构定义和类型是 `LoginStatusBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取登录状态

**接口地址 :** `/login/status`
