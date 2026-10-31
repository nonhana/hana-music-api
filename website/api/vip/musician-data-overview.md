---
title: '音乐人数据概况'
description: '音乐人登录后调用此接口，可获取统计数据概况'
---

# 音乐人数据概况

> 音乐人登录后调用此接口，可获取统计数据概况

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/musician/data/overview` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 是                        |
| 对应模块 | `musician_data_overview`  |
| 文档分类 | 会员与云贝                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /musician/data/overview
```

## 编程式调用

```ts
import { musicianDataOverview } from 'hana-music-api';

const result = await musicianDataOverview();

console.log(result.body);
```

## 返回内容

`body.code` 和通到概况对象的 `body.data` 收紧；各项统计（`availableExtractIncomeTotal`、`productionTotal`、`musicianLevelScore`、`totalFansCount`）宽松，`playCount`、`totalPlayCount`、`fansPlayCount`、`fansPlayRatio`、`followerCountIncrement` 只见过 `null`，没有声明。录制来自音乐人账号（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `anonimousUser: false`（未落盘））；未登录（匿名）返回 `code: 10000`（`musician_data_overview.anonymous.json`），SDK 以 `status: 400` 转交原文；登录的非音乐人账号未录到，返回码与成功正文未验证。结构定义和类型是 `MusicianDataOverviewBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 音乐人登录后调用此接口，可获取统计数据概况

**接口地址 :** `/musician/data/overview`

**调用例子 :** `/musician/data/overview`
