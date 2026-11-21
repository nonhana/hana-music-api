---
title: '签到进度'
description: '调用此接口，可获得签到进度'
---

# 签到进度

调用此接口，可获得签到进度

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/signin/progress`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `signin_progress`                                        |
| SDK 函数   | `signinProgress`（`hana-music-api/api/signin_progress`） |
| 返回体类型 | `SigninProgressBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { signinProgress } from 'hana-music-api';

const result = await signinProgress(
  {
    moduleId: '1207signin-1207signin',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/signin/progress' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'moduleId=1207signin-1207signin'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值                  | 说明                                    |
| ---------- | -------- | ---- | ----------------------- | --------------------------------------- |
| `moduleId` | `string` | 否   | `1207signin-1207signin` | 模块 id，默认为 '1207signin-1207signin' |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SigninProgressBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/signin_progress`、`hana-music-api/schemas/signin_progress` 导入运行时校验器）。

```ts
type SigninRecord = {
  day: string;
  signed?: boolean | null;
};

type Prize = {
  amount?: number | null;
  description?: string | null;
  name?: string | null;
  obtained?: boolean | null;
  obtainedImageUrl?: string | null;
  prizeImageUrl?: string | null;
  progress?: number | null;
  type?: string | null;
  url?: string | null;
};

type SigninStat = {
  id: number;
  calcType?: string | null;
  currentProgress?: number | null;
  description?: string | null;
  endTime?: number | null;
  maxProgressReachDay?: string | null;
  maxProgressReached?: number | null;
  prizes?: Array<Prize> | null;
  repeatType?: string | null;
  startDay?: string | null;
  startTime?: number | null;
};

type SigninProgressBody = {
  code: 200;
  data: {
    records: Array<SigninRecord>;
    stats: Array<SigninStat>;
    today: {
      todaySignedIn: boolean;
      todayStats: Array<SigninStat>;
    };
    endTime?: number | null;
    startTime?: number | null;
  };
  message?: string | null;
};
```

| 字段                               | 类型                  | 必填 | 说明                         |
| ---------------------------------- | --------------------- | ---- | ---------------------------- |
| `code`                             | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`                             | `object`              | 是   | 接口返回的数据主体           |
| `data.records`                     | `Array<SigninRecord>` | 是   | 记录列表                     |
| `data.records[].day`               | `string`              | 是   | -                            |
| `data.records[].signed`            | `boolean`             | 否   | -                            |
| `data.stats`                       | `Array<SigninStat>`   | 是   | -                            |
| `data.stats[].id`                  | `number`              | 是   | 记录 ID                      |
| `data.stats[].calcType`            | `string`              | 否   | -                            |
| `data.stats[].currentProgress`     | `number`              | 否   | -                            |
| `data.stats[].description`         | `string`              | 否   | 描述信息                     |
| `data.stats[].endTime`             | `number`              | 否   | 时间戳                       |
| `data.stats[].maxProgressReachDay` | `string`              | 否   | -                            |
| `data.stats[].maxProgressReached`  | `number`              | 否   | -                            |
| `data.stats[].prizes`              | `Array<Prize>`        | 否   | -                            |
| `data.stats[].repeatType`          | `string`              | 否   | -                            |
| `data.stats[].startDay`            | `string`              | 否   | -                            |
| `data.stats[].startTime`           | `number`              | 否   | 时间戳                       |
| `data.today`                       | `object`              | 是   | -                            |
| `data.today.todaySignedIn`         | `boolean`             | 是   | -                            |
| `data.today.todayStats`            | `Array<SigninStat>`   | 是   | -                            |
| `data.endTime`                     | `number`              | 否   | 时间戳                       |
| `data.startTime`                   | `number`              | 否   | 时间戳                       |
| `message`                          | `string`              | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
