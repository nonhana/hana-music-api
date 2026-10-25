---
title: '云贝'
description: '登录后调用此接口可获取云贝签到信息(连续签到天数,第二天全部可获得的云贝)'
---

# 云贝

> 登录后调用此接口可获取云贝签到信息(连续签到天数,第二天全部可获得的云贝)

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/yunbei`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `yunbei`       |
| 文档分类 | 会员与云贝     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei
```

## 编程式调用

```ts
import { yunbei } from 'hana-music-api';

const result = await yunbei();

console.log(result.body);
```

## 返回内容

`body.code`、签到状态路径 `body.data` 及连续签到天数 `data.days`、当天获得的云贝 `data.shells` 收紧。结构定义和类型是 `YunbeiBody`，见[返回体结构](/guide/response-bodies)。

匿名调用返回 `body.code: 302`，SDK 按业务失败转交为 HTTP 302；匿名对照录制是 `vip/yunbei.anonymous.json`。

## 补充说明

说明 : 登录后调用此接口可获取云贝签到信息(连续签到天数,第二天全部可获得的云贝)

**接口地址 :** `/yunbei`

**调用例子 :** `/yunbei`
