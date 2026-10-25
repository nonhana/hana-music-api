---
title: '检测手机号码是否已注册'
description: '调用此接口 ,可检测手机号码是否已注册'
---

# 检测手机号码是否已注册

> 调用此接口 ,可检测手机号码是否已注册

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/cellphone/existence/check` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `cellphone_existence_check`  |
| 文档分类 | 用户与登录                   |

## 请求参数

| 参数          | 类型   | 必填 | 默认值 | 说明                                                      |
| ------------- | ------ | :--: | ------ | --------------------------------------------------------- |
| `phone`       | string |  ✅  | -      | 手机号码                                                  |
| `countrycode` | string |  —   | 86     | 国家码，用于国外手机号，例如美国传入：`1` ,默认 86 即中国 |

## HTTP 示例

```bash
GET /cellphone/existence/check?phone=13xxx
```

## 编程式调用

```ts
import { cellphoneExistenceCheck } from 'hana-music-api';

const result = await cellphoneExistenceCheck({
  phone: '13xxx',
});

console.log(result.body);
```

## 返回内容

手机号是否已注册在 `exist`：`1` 表示已注册，`-1` 表示未注册。`code` 和 `exist` 收紧；`nickname`、`avatarUrl`、`hasPassword`、`hasSnsBinded`、`countryCode` 和回显的 `cellphone` 宽松，未注册号码的 `nickname`、`hasSnsBinded` 可以是 `null`。结构定义和类型是 `CellphoneExistenceCheckBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口 ,可检测手机号码是否已注册  
**必选参数 :**  
`phone` : 手机号码

**可选参数 :**  
`countrycode`: 国家码，用于国外手机号，例如美国传入：`1` ,默认 86 即中国

**接口地址 :** `/cellphone/existence/check`

**调用例子 :** `/cellphone/existence/check?phone=13xxx`
