---
title: '游客登录'
description: '直接调用此接口, 可获取游客cookie,如果遇到其他接口未登录状态报400状态码需要验证的错误,可使用此接口获取游客cookie避免报错'
---

# 游客登录

> 直接调用此接口, 可获取游客cookie,如果遇到其他接口未登录状态报400状态码需要验证的错误,可使用此接口获取游客cookie避免报错

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/register/anonimous` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `register_anonimous`  |
| 文档分类 | 用户与登录            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /register/anonimous
```

## 编程式调用

```ts
import { registerAnonimous } from 'hana-music-api';

const result = await registerAnonimous();

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`，新建匿名账号自己的编号 `body.userId` 和匿名凭据 `body.cookie` 收紧；`body.createTime` 宽松。`body.cookie` 由响应的 Set-Cookie 拼出，不是上游 JSON 字段，拼好后和上游 JSON 一起校验。录制是匿名注册的成功正文（`register_anonimous.default.json`，账号编号已换成合成值），公开体的凭据只在 `context.expect` 保留脱敏占位值，真实令牌不落盘。结构定义和类型是 `RegisterAnonimousBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 直接调用此接口, 可获取游客cookie,如果遇到其他接口未登录状态报400状态码需要验证的错误,可使用此接口获取游客cookie避免报错

**接口地址 :** `/register/anonimous`
