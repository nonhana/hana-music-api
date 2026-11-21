---
title: '音乐日历'
description: '传入开始和结束时间获取音乐日历，匿名可读'
---

# 音乐日历

传入开始和结束时间获取音乐日历，匿名可读

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                          |
| ---------- | ------------------------------------------- |
| 接口地址   | `/calendar`                                 |
| 请求方式   | `GET` / `POST`                              |
| 需要登录   | 否                                          |
| 对应模块   | `calendar`                                  |
| SDK 函数   | `calendar`（`hana-music-api/api/calendar`） |
| 返回体类型 | `CalendarBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { calendar } from 'hana-music-api';

const result = await calendar({
  startTime: 1606752000000,
  endTime: 1609430399999,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/calendar' \
  --data-urlencode 'startTime=1606752000000' \
  --data-urlencode 'endTime=1609430399999'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型     | 必填 | 默认值     | 说明                               |
| ----------- | -------- | ---- | ---------- | ---------------------------------- |
| `endTime`   | `number` | 否   | 当前时间戳 | 结束时间戳（毫秒），默认取当前时间 |
| `startTime` | `number` | 否   | 当前时间戳 | 开始时间戳（毫秒），默认取当前时间 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CalendarBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/calendar`、`hana-music-api/schemas/calendar` 导入运行时校验器）。

```ts
type CalendarEvent = {
  id: string;
  eventType?: string | null;
  onlineTime?: number | null;
  offlineTime?: number | null;
  tag?: string | null;
  title?: string | null;
  imgUrl?: string | null;
  canRemind?: boolean | null;
  reminded?: boolean | null;
  targetUrl?: string | null;
  remindText?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  eventStatus?: string | null;
  remindedText?: string | null;
  headline?: boolean | null;
  subCount?: number | null;
};

type CalendarButton = {
  text?: string | null;
  targetUrl?: string | null;
};

type CalendarConfig = {
  button?: CalendarButton | null;
};

type CalendarBody = {
  code: 200;
  data: {
    calendarEvents: Array<CalendarEvent>;
    calendarConfig?: CalendarConfig | null;
  };
  message?: string | null;
};
```

| 字段                         | 类型                   | 必填 | 说明                         |
| ---------------------------- | ---------------------- | ---- | ---------------------------- |
| `code`                       | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `data`                       | `object`               | 是   | 接口返回的数据主体           |
| `data.calendarEvents`        | `Array<CalendarEvent>` | 是   | -                            |
| `data.calendarConfig`        | `CalendarConfig`       | 否   | -                            |
| `data.calendarConfig.button` | `CalendarButton`       | 否   | -                            |
| `message`                    | `string`               | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
