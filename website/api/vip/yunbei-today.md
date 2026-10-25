---
title: '云贝今日签到信息'
description: '登录后调用此接口可获取云贝今日签到信息(今日签到获取的云贝数)'
---

# 云贝今日签到信息

> 登录后调用此接口可获取云贝今日签到信息(今日签到获取的云贝数)

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/yunbei/today` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `yunbei_today`  |
| 文档分类 | 会员与云贝      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/today
```

## 编程式调用

```ts
import { yunbeiToday } from 'hana-music-api';

const result = await yunbeiToday();

console.log(result.body);
```

## 返回内容

`body.code`、今日云贝路径 `body.data` 及当天获得的云贝 `data.shells` 收紧；本账号录制时是 0。结构定义和类型是 `YunbeiTodayBody`，见[返回体结构](/guide/response-bodies)。

匿名调用返回 `body.code: 302`，SDK 按业务失败转交为 HTTP 302；匿名对照录制是 `vip/yunbei_today.anonymous.json`。

## 补充说明

说明 : 登录后调用此接口可获取云贝今日签到信息(今日签到获取的云贝数)

**接口地址 :** `/yunbei/today`

**调用例子 :** `/yunbei/today`
