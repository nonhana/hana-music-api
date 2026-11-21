---
title: '电台 - 今日优选'
description: '登录后调用此接口，可获得电台今日优选'
---

# 电台 - 今日优选

登录后调用此接口，可获得电台今日优选

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/dj/today/perfered`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 是                                                          |
| 对应模块   | `dj_today_perfered`                                         |
| SDK 函数   | `djTodayPerfered`（`hana-music-api/api/dj_today_perfered`） |
| 返回体类型 | `DjTodayPerferedBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djTodayPerfered } from 'hana-music-api';

const result = await djTodayPerfered(
  {
    page: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/today/perfered' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'page=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型     | 必填 | 默认值 | 说明           |
| ------ | -------- | ---- | ------ | -------------- |
| `page` | `number` | 否   | `0`    | 页码，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjTodayPerferedBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_today_perfered`、`hana-music-api/schemas/dj_today_perfered` 导入运行时校验器）。

```ts
type DjTodayPerferedBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
