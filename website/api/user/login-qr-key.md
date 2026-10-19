---
title: '二维码 key 生成接口'
description: '调用此接口可生成一个 key'
---

# 二维码 key 生成接口

> 调用此接口可生成一个 key

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/login/qr/key` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `login_qr_key`  |
| 文档分类 | 用户与登录      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /login/qr/key
```

## 编程式调用

```ts
import { loginQrKey } from 'hana-music-api';

const result = await loginQrKey();

console.log(result.body);
```

## 返回内容

```json
{ "code": 200, "data": { "code": 200, "unikey": "your-qr-key" } }
```

`data.unikey` 就是传给 [生成二维码](/api/user/login-qr-create) 和 [查询扫码状态](/api/user/login-qr-check) 的 `key`。结构定义和类型是 `LoginQrKeyBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口可生成一个 key

**接口地址 :** `/login/qr/key`
