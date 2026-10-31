---
title: '云贝账户信息'
description: '无需登录即可调用；登录后返回当前账号的云贝账户信息（账户云贝数）'
---

# 云贝账户信息

> 无需登录即可调用；登录后返回当前账号的云贝账户信息（账户云贝数）

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/yunbei/info` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `yunbei_info`  |
| 文档分类 | 会员与云贝     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/info
```

## 编程式调用

```ts
import { yunbeiInfo } from 'hana-music-api';

const result = await yunbeiInfo();

console.log(result.body);
```

## 返回内容

`body.code`、云贝账户记录 `body.userPoint` 及其 `userId`、`balance` 收紧；账户等级、签到标记和票券文案宽松，只见过 `null` 的配置字段未声明、原样保留。结构定义和类型是 `YunbeiInfoBody`，见[返回体结构](/guide/response-bodies)。

匿名调用返回 `body.code: 200`，正文同样通过结构校验（匿名账号的 `userPoint.userId` 是匿名用户编号）；匿名对照录制是 `vip/yunbei_info.anonymous.json`。

## 补充说明

说明 :无需登录即可调用；登录后返回当前账号的云贝账户信息（账户云贝数）

**接口地址 :** `/yunbei/info`

**调用例子 :** `/yunbei/info`
