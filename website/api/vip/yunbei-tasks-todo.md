---
title: '云贝 todo 任务'
description: '无需登录即可调用；登录后返回当前账号的云贝 todo 任务'
---

# 云贝 todo 任务

> 无需登录即可调用；登录后返回当前账号的云贝 todo 任务

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/yunbei/tasks/todo` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `yunbei_tasks_todo`  |
| 文档分类 | 会员与云贝           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/tasks/todo
```

## 编程式调用

```ts
import { yunbeiTasksTodo } from 'hana-music-api';

const result = await yunbeiTasksTodo();

console.log(result.body);
```

## 返回内容

`body.code`、待办任务列表路径 `body.data` 及每个任务的编号 `data[].userTaskId` 收紧（任务未开始时为 0）；任务名、奖励和链接宽松。结构定义和类型是 `YunbeiTasksTodoBody`，见[返回体结构](/guide/response-bodies)。

匿名调用返回 `body.code: 200`，正文同样通过结构校验；匿名对照录制是 `vip/yunbei_tasks_todo.anonymous.json`。本批未录到空任务列表（未验证是否可达）。

## 补充说明

说明 :无需登录即可调用；登录后返回当前账号的云贝 todo 任务

**接口地址 :** `/yunbei/tasks/todo`

**调用例子 :** `/yunbei/tasks/todo`
