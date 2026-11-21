---
title: '私信和通知接口'
description: '登录后调用此接口，可获取私信和通知数量信息'
---

# 私信和通知接口

登录后调用此接口，可获取私信和通知数量信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/pl/count`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 是                                         |
| 对应模块   | `pl_count`                                 |
| SDK 函数   | `plCount`（`hana-music-api/api/pl_count`） |
| 返回体类型 | `PlCountBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { plCount } from 'hana-music-api';

const result = await plCount({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/pl/count' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlCountBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/pl_count`、`hana-music-api/schemas/pl_count` 导入运行时校验器）。

```ts
type PlCountBody = {
  code: 200;
  battle?: {
    endTime?: number | null;
    showQuizIcon?: boolean | null;
    startTime?: number | null;
  } | null;
  comment?: number | null;
  createDJRadioCount?: number | null;
  event?: number | null;
  eventUser?: {
    eventId?: number | null;
    source?: number | null;
    style?: number | null;
    userAvatar?: string | null;
    userId?: number | null;
  } | null;
  follow?: number | null;
  forward?: number | null;
  friend?: {
    celebrityCount?: number | null;
    count?: number | null;
    snsCount?: number | null;
  } | null;
  invitationVersion?: number | null;
  msg?: number | null;
  newProgramCount?: number | null;
  newTheme?: boolean | null;
  notice?: number | null;
  pushMsg?: string | null;
  sceneComments?: {
    musician_comments?: number | null;
    social_comments?: number | null;
  } | null;
  totalComment?: number | null;
  ydAntiUrlConfigVersion?: number | null;
};
```

| 字段                              | 类型      | 必填 | 说明                         |
| --------------------------------- | --------- | ---- | ---------------------------- |
| `code`                            | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `battle`                          | `object`  | 否   | -                            |
| `battle.endTime`                  | `number`  | 否   | 时间戳                       |
| `battle.showQuizIcon`             | `boolean` | 否   | -                            |
| `battle.startTime`                | `number`  | 否   | 时间戳                       |
| `comment`                         | `number`  | 否   | -                            |
| `createDJRadioCount`              | `number`  | 否   | -                            |
| `event`                           | `number`  | 否   | 动态列表                     |
| `eventUser`                       | `object`  | 否   | -                            |
| `eventUser.eventId`               | `number`  | 否   | event ID                     |
| `eventUser.source`                | `number`  | 否   | -                            |
| `eventUser.style`                 | `number`  | 否   | -                            |
| `eventUser.userAvatar`            | `string`  | 否   | -                            |
| `eventUser.userId`                | `number`  | 否   | 用户 ID                      |
| `follow`                          | `number`  | 否   | -                            |
| `forward`                         | `number`  | 否   | -                            |
| `friend`                          | `object`  | 否   | -                            |
| `friend.celebrityCount`           | `number`  | 否   | -                            |
| `friend.count`                    | `number`  | 否   | 条目总数                     |
| `friend.snsCount`                 | `number`  | 否   | -                            |
| `invitationVersion`               | `number`  | 否   | -                            |
| `msg`                             | `number`  | 否   | 提示信息                     |
| `newProgramCount`                 | `number`  | 否   | -                            |
| `newTheme`                        | `boolean` | 否   | -                            |
| `notice`                          | `number`  | 否   | -                            |
| `pushMsg`                         | `string`  | 否   | -                            |
| `sceneComments`                   | `object`  | 否   | -                            |
| `sceneComments.musician_comments` | `number`  | 否   | -                            |
| `sceneComments.social_comments`   | `number`  | 否   | -                            |
| `totalComment`                    | `number`  | 否   | -                            |
| `ydAntiUrlConfigVersion`          | `number`  | 否   | -                            |

<!-- api-doc:response:end -->
