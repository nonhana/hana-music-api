---
title: '退出登录'
description: '调用此接口，可退出登录'
---

# 退出登录

> 调用此接口，可退出登录

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/logout`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `logout`       |
| 文档分类 | 用户与登录     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /logout
```

## 编程式调用

```ts
import { logout } from 'hana-music-api';

const result = await logout();

console.log(result.body);
```

## 返回内容

```json
{ "code": 200 }
```

只注销同一个设备编号（`deviceId`）上的登录，听众在其他设备上的登录不受影响。结构定义和类型是 `LogoutBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可退出登录

**调用例子 :** `/logout`
