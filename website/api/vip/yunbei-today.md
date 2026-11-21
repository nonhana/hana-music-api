---
title: '云贝今日签到信息'
description: '登录后调用此接口可获取云贝今日签到信息(今日签到获取的云贝数)'
---

# 云贝今日签到信息

登录后调用此接口可获取云贝今日签到信息(今日签到获取的云贝数)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/yunbei/today`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `yunbei_today`                                     |
| SDK 函数   | `yunbeiToday`（`hana-music-api/api/yunbei_today`） |
| 返回体类型 | `YunbeiTodayBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbeiToday } from 'hana-music-api';

const result = await yunbeiToday({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/yunbei/today' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`YunbeiTodayBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/yunbei_today`、`hana-music-api/schemas/yunbei_today` 导入运行时校验器）。

```ts
type YunbeiTodayBody = {
  code: 200;
  data: {
    shells: number;
  };
};
```

| 字段          | 类型     | 必填 | 说明                         |
| ------------- | -------- | ---- | ---------------------------- |
| `code`        | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `object` | 是   | 接口返回的数据主体           |
| `data.shells` | `number` | 是   | -                            |

<!-- api-doc:response:end -->
