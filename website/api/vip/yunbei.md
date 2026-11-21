---
title: '云贝'
description: '登录后调用此接口可获取云贝签到信息(连续签到天数，第二天全部可获得的云贝)'
---

# 云贝

登录后调用此接口可获取云贝签到信息(连续签到天数，第二天全部可获得的云贝)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                      |
| ---------- | --------------------------------------- |
| 接口地址   | `/yunbei`                               |
| 请求方式   | `GET` / `POST`                          |
| 需要登录   | 是                                      |
| 对应模块   | `yunbei`                                |
| SDK 函数   | `yunbei`（`hana-music-api/api/yunbei`） |
| 返回体类型 | `YunbeiBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { yunbei } from 'hana-music-api';

const result = await yunbei({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/yunbei' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`YunbeiBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/yunbei`、`hana-music-api/schemas/yunbei` 导入运行时校验器）。

```ts
type YunbeiBody = {
  code: 200;
  data: {
    days: number;
    shells: number;
  };
};
```

| 字段          | 类型     | 必填 | 说明                         |
| ------------- | -------- | ---- | ---------------------------- |
| `code`        | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `object` | 是   | 接口返回的数据主体           |
| `data.days`   | `number` | 是   | -                            |
| `data.shells` | `number` | 是   | -                            |

<!-- api-doc:response:end -->
