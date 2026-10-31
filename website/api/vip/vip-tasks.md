---
title: 'vip 任务'
description: '登录后调用此接口，可获取会员任务'
---

# vip 任务

> 登录后调用此接口，可获取会员任务

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/vip/tasks`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `vip_tasks`    |
| 文档分类 | 会员与云贝     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /vip/tasks
```

## 编程式调用

```ts
import { vipTasks } from 'hana-music-api';

const result = await vipTasks();

console.log(result.body);
```

## 返回内容

`body.code`、任务页 `body.data`、任务分组 `body.data.taskList`、组内任务 `body.data.taskList[].taskItems` 和任务的 `taskId` 收紧；本批只录到一条任务，`taskId` 为字符串；其余任务字段宽松，只见过 `null` 的字段没有声明。本批录制（匿名与登录）没有出现可达的空任务列表。匿名对照录制保留为 `vip/vip_tasks.anonymous.json`。结构定义和类型是 `VipTasksBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获取会员任务

**接口地址 :** `/vip/tasks`

**调用例子 :** `/vip/tasks`
