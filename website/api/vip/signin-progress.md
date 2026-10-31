---
title: '签到进度'
description: '调用此接口，可获得签到进度'
---

# 签到进度

> 调用此接口，可获得签到进度

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/signin/progress` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `signin_progress`  |
| 文档分类 | 会员与云贝         |

## 请求参数

| 参数       | 类型   | 必填 | 默认值                  | 说明                                    |
| ---------- | ------ | :--: | ----------------------- | --------------------------------------- |
| `moduleId` | string |  —   | '1207signin-1207signin' | 模块 id，默认为 '1207signin-1207signin' |

## HTTP 示例

```bash
GET /signin/progress?moduleId=1207signin-1207signin
```

## 编程式调用

```ts
import { signinProgress } from 'hana-music-api';

const result = await signinProgress({
  moduleId: '1207signin-1207signin',
});

console.log(result.body);
```

## 返回内容

`body.code`、签到页 `body.data`、今日签到状态 `body.data.today.todaySignedIn`、签到记录 `body.data.records` 及每条记录的日期 `day`、签到统计 `body.data.stats` 与 `body.data.today.todayStats` 及统计的 `id` 收紧；记录的 `signed`、统计描述、进度和奖品字段宽松。结构定义和类型是 `SigninProgressBody`，见[返回体结构](/guide/response-bodies)。

本账号录制时未签到（`records[].signed` 全为 `false`）；30 天记录、3 条统计和今日统计都是非空数组，空窗口没有录到。非法 `moduleId` 返回 `body.code: 400`，SDK 按业务失败转交为 HTTP 400。匿名调用返回 `body.code: 301`（用户未登录），SDK 转交为 HTTP 301；匿名对照录制是 `signin/signin_progress.anonymous.json`。

## 补充说明

说明 : 调用此接口，可获得签到进度

**可选参数 :** `moduleId` : 模块 id，默认为 '1207signin-1207signin'

**接口地址 :** `/signin/progress`

**调用例子 :** `/signin/progress?moduleId=1207signin-1207signin`
