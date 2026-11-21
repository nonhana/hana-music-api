---
title: '音乐人任务'
description: '音乐人登录后调用此接口，可获取音乐人任务。返回的数据中`status`字段为任务状态，0 表示任务未开始，10 表示任务正在进行中，20 表示任务完成，但未领取云豆，100 表示任务完成，并且已经领取了相应的云豆(貌似只能获取到做过的任务了)'
---

# 音乐人任务

音乐人登录后调用此接口，可获取音乐人任务。返回的数据中`status`字段为任务状态，0 表示任务未开始，10 表示任务正在进行中，20 表示任务完成，但未领取云豆，100 表示任务完成，并且已经领取了相应的云豆(貌似只能获取到做过的任务了)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/musician/tasks`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `musician_tasks`                                       |
| SDK 函数   | `musicianTasks`（`hana-music-api/api/musician_tasks`） |
| 返回体类型 | `MusicianTasksBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicianTasks } from 'hana-music-api';

const result = await musicianTasks({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/musician/tasks' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MusicianTasksBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/musician_tasks`、`hana-music-api/schemas/musician_tasks` 导入运行时校验器）。

```ts
type Mission = {
  missionId: number;
  actionType?: number | null;
  business?: string | null;
  button?: string | null;
  createTime?: number | null;
  description?: string | null;
  endTime?: number | null;
  extendInfo?: string | null;
  jumpLink?: string | null;
  missionEntityId?: number | null;
  name?: string | null;
  needToReceive?: number | null;
  period?: number | null;
  platform?: number | null;
  progressRate?: number | null;
  rewardId?: number | null;
  rewardType?: number | null;
  rewardWorth?: string | null;
  sortValue?: number | null;
  startTime?: number | null;
  status?: number | null;
  subAction?: string | null;
  tag?: number | null;
  targetCount?: number | null;
  type?: number | null;
  updateTime?: number | null;
  userMissionId?: number | null;
  userUnObtainRewardExpireTime?: number | null;
  userId?: number | null;
  wapLink?: string | null;
  wapText?: string | null;
  webLink?: string | null;
  webText?: string | null;
};

type MusicianTasksBody = {
  code: 200;
  data: {
    list: Array<Mission>;
  };
  message?: string | null;
};
```

| 字段        | 类型             | 必填 | 说明                         |
| ----------- | ---------------- | ---- | ---------------------------- |
| `code`      | `200`            | 是   | 业务状态码（`200` 表示成功） |
| `data`      | `object`         | 是   | 接口返回的数据主体           |
| `data.list` | `Array<Mission>` | 是   | 结果条目列表                 |
| `message`   | `string`         | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
