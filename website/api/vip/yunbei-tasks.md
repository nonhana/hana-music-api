---
title: '云贝所有任务'
description: '无需登录即可调用；登录后返回当前账号的云贝所有任务'
---

# 云贝所有任务

> 无需登录即可调用；登录后返回当前账号的云贝所有任务

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/yunbei/tasks` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `yunbei_tasks`  |
| 文档分类 | 会员与云贝      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/tasks
```

## 编程式调用

```ts
import { yunbeiTasks } from 'hana-music-api';

const result = await yunbeiTasks();

console.log(result.body);
```

## 返回内容

`body.code`、任务列表路径 `body.data` 及每个任务的编号 `data[].taskId` 收紧；任务说明、图标、链接和奖励明细宽松，只见过 `null` 的 `wordsPicUrl`、图标与目标状态字段未声明。结构定义和类型是 `YunbeiTasksBody`，见[返回体结构](/guide/response-bodies)。

匿名调用返回 `body.code: 200`，正文同样通过结构校验；匿名对照录制是 `vip/yunbei_tasks.anonymous.json`。本批未录到空任务列表（未验证是否可达）。

## 补充说明

说明 :无需登录即可调用；登录后返回当前账号的云贝所有任务

**接口地址 :** `/yunbei/tasks`

**调用例子 :** `/yunbei/tasks`
