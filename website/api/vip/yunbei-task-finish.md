---
title: '云贝完成任务'
description: '云贝完成任务 接口文档。'
---

# 云贝完成任务

云贝完成任务 接口文档。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/yunbei/task/finish`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 是                                                            |
| 对应模块   | `yunbei_task_finish`                                          |
| SDK 函数   | `yunbeiTaskFinish`（`hana-music-api/api/yunbei_task_finish`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbeiTaskFinish } from 'hana-music-api';

const result = await yunbeiTaskFinish(
  {
    userTaskId: '5146243240',
    depositCode: 0,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/yunbei/task/finish' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'userTaskId=5146243240' \
  --data-urlencode 'depositCode=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型               | 必填 | 默认值 | 说明             |
| ------------- | ------------------ | ---- | ------ | ---------------- |
| `userTaskId`  | `number \| string` | 是   | -      | 任务 id          |
| `depositCode` | `number`           | 否   | `0`    | 任务 depositCode |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
