---
title: '音乐人任务'
description: '音乐人登录后调用此接口，可获取音乐人任务。返回的数据中`status`字段为任务状态，0 表示任务未开始，10 表示任务正在进行中，20 表示任务完成，但未领取云豆，100 表示任务完成，并且已经领取了相应的云豆(貌似只能获取到做过的任务了)'
---

# 音乐人任务

> 音乐人登录后调用此接口，可获取音乐人任务。返回的数据中`status`字段为任务状态，0 表示任务未开始，10 表示任务正在进行中，20 表示任务完成，但未领取云豆，100 表示任务完成，并且已经领取了相应的云豆(貌似只能获取到做过的任务了)

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/musician/tasks` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `musician_tasks`  |
| 文档分类 | 会员与云贝        |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /musician/tasks
```

## 编程式调用

```ts
import { musicianTasks } from 'hana-music-api';

const result = await musicianTasks();

console.log(result.body);
```

## 返回内容

`body.code`、任务列表 `body.data.list` 和每个任务的编号 `body.data.list[].missionId` 收紧；其余任务字段宽松，`extendInfo` 是 JSON 字符串。录制来自音乐人账号（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `anonimousUser: false`（未落盘）），有 7 条任务；本批没有录到任务列表为空的账号，`data.list` 在空账号下的实际表现未验证。匿名调用返回 `code: 301`（`musician_tasks.anonymous.json`），SDK 以 `status: 301` 转交原文。结构定义和类型是 `MusicianTasksBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 音乐人登录后调用此接口，可获取音乐人任务。返回的数据中`status`字段为任务状态，0 表示任务未开始，10 表示任务正在进行中，20 表示任务完成，但未领取云豆，100 表示任务完成，并且已经领取了相应的云豆(貌似只能获取到做过的任务了)

**接口地址 :** `/musician/tasks`

**调用例子 :** `/musician/tasks`
