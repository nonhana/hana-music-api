---
title: '云贝 todo 任务'
description: '无需登录即可调用；登录后返回当前账号的云贝 todo 任务'
---

# 云贝 todo 任务

无需登录即可调用；登录后返回当前账号的云贝 todo 任务

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/yunbei/tasks/todo`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `yunbei_tasks_todo`                                         |
| SDK 函数   | `yunbeiTasksTodo`（`hana-music-api/api/yunbei_tasks_todo`） |
| 返回体类型 | `YunbeiTasksTodoBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbeiTasksTodo } from 'hana-music-api';

const result = await yunbeiTasksTodo();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/yunbei/tasks/todo'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`YunbeiTasksTodoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/yunbei_tasks_todo`、`hana-music-api/schemas/yunbei_tasks_todo` 导入运行时校验器）。

```ts
type TodoTask = {
  userTaskId: number;
  completed?: boolean | null;
  depositCode?: number | null;
  expireTime?: number | null;
  link?: string | null;
  period?: number | null;
  taskName?: string | null;
  taskPoint?: number | null;
};

type YunbeiTasksTodoBody = {
  code: 200;
  data: Array<TodoTask>;
  message?: string | null;
};
```

| 字段                 | 类型              | 必填 | 说明                         |
| -------------------- | ----------------- | ---- | ---------------------------- |
| `code`               | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`               | `Array<TodoTask>` | 是   | 接口返回的数据主体           |
| `data[].userTaskId`  | `number`          | 是   | userTask ID                  |
| `data[].completed`   | `boolean`         | 否   | -                            |
| `data[].depositCode` | `number`          | 否   | -                            |
| `data[].expireTime`  | `number`          | 否   | 时间戳                       |
| `data[].link`        | `string`          | 否   | -                            |
| `data[].period`      | `number`          | 否   | -                            |
| `data[].taskName`    | `string`          | 否   | -                            |
| `data[].taskPoint`   | `number`          | 否   | -                            |
| `message`            | `string`          | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
