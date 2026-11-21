---
title: '云贝所有任务'
description: '无需登录即可调用；登录后返回当前账号的云贝所有任务'
---

# 云贝所有任务

无需登录即可调用；登录后返回当前账号的云贝所有任务

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/yunbei/tasks`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `yunbei_tasks`                                     |
| SDK 函数   | `yunbeiTasks`（`hana-music-api/api/yunbei_tasks`） |
| 返回体类型 | `YunbeiTasksBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbeiTasks } from 'hana-music-api';

const result = await yunbeiTasks();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/yunbei/tasks'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`YunbeiTasksBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/yunbei_tasks`、`hana-music-api/schemas/yunbei_tasks` 导入运行时校验器）。

```ts
type TaskExtInfo = {
  missionCode?: string | null;
};

type TaskPointDetail = {
  progressRate?: number | null;
  rewardExtendInfo?: string | null;
  rewardId?: number | null;
  rewardType?: number | null;
  sortValue?: number | null;
  stageType?: number | null;
  status?: number | null;
  sumTarget?: number | null;
  times?: number | null;
  userMissionId?: number | null;
  value?: number | null;
  worth?: number | null;
};

type Task = {
  taskId: number;
  actionType?: number | null;
  completed?: boolean | null;
  completedPoint?: number | null;
  extInfoMap?: TaskExtInfo | null;
  link?: string | null;
  linkText?: string | null;
  period?: number | null;
  position?: number | null;
  status?: number | null;
  subAction?: string | null;
  targetPoint?: number | null;
  targetUserTaskId?: number | null;
  taskDescription?: string | null;
  taskName?: string | null;
  taskPoint?: number | null;
  taskPointDetail?: Array<TaskPointDetail> | null;
  taskType?: string | null;
  userTaskId?: number | null;
  webPicUrl?: string | null;
};

type YunbeiTasksBody = {
  code: 200;
  data: Array<Task>;
  message?: string | null;
};
```

| 字段      | 类型          | 必填 | 说明                         |
| --------- | ------------- | ---- | ---------------------------- |
| `code`    | `200`         | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `Array<Task>` | 是   | 接口返回的数据主体           |
| `message` | `string`      | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
