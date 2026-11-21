---
title: 'vip 任务'
description: '登录后调用此接口，可获取会员任务'
---

# vip 任务

登录后调用此接口，可获取会员任务

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/vip/tasks`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 是                                           |
| 对应模块   | `vip_tasks`                                  |
| SDK 函数   | `vipTasks`（`hana-music-api/api/vip_tasks`） |
| 返回体类型 | `VipTasksBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipTasks } from 'hana-music-api';

const result = await vipTasks({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/vip/tasks' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VipTasksBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/vip_tasks`、`hana-music-api/schemas/vip_tasks` 导入运行时校验器）。

```ts
type TaskItem = {
  taskId: string;
  action?: string | null;
  actionType?: number | null;
  basicTaskId?: number | null;
  currentProgress?: number | null;
  description?: string | null;
  growthPoint?: number | null;
  iconUrl?: string | null;
  missionId?: number | null;
  name?: string | null;
  needReceive?: boolean | null;
  period?: number | null;
  progressType?: number | null;
  ruleId?: number | null;
  seqTag?: number | null;
  showProgress?: boolean | null;
  sortValue?: number | null;
  status?: number | null;
  tagId?: number | null;
  targetWorth?: number | null;
  taskTag?: string | null;
  totalUngetScore?: number | null;
  type?: number | null;
  updateTime?: number | null;
  url?: string | null;
};

type TaskGroup = {
  taskItems: Array<TaskItem>;
  seq?: number | null;
  seqName?: string | null;
  taskType?: number | null;
};

type VipTasksBody = {
  code: 200;
  data: {
    taskList: Array<TaskGroup>;
    taskScore?: number | null;
  };
  message?: string | null;
};
```

| 字段                        | 类型               | 必填 | 说明                         |
| --------------------------- | ------------------ | ---- | ---------------------------- |
| `code`                      | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`                      | `object`           | 是   | 接口返回的数据主体           |
| `data.taskList`             | `Array<TaskGroup>` | 是   | -                            |
| `data.taskList[].taskItems` | `Array<TaskItem>`  | 是   | -                            |
| `data.taskList[].seq`       | `number`           | 否   | -                            |
| `data.taskList[].seqName`   | `string`           | 否   | -                            |
| `data.taskList[].taskType`  | `number`           | 否   | -                            |
| `data.taskScore`            | `number`           | 否   | -                            |
| `message`                   | `string`           | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
