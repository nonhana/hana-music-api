---
title: '电台 banner'
description: '调用此接口，可获取电台 banner'
---

# 电台 banner

调用此接口，可获取电台 banner

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/dj/banner`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `dj_banner`                                  |
| SDK 函数   | `djBanner`（`hana-music-api/api/dj_banner`） |
| 返回体类型 | `DjBannerBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djBanner } from 'hana-music-api';

const result = await djBanner();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/dj/banner'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjBannerBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_banner`、`hana-music-api/schemas/dj_banner` 导入运行时校验器）。

```ts
type Banner = {
  exclusive?: boolean | null;
  pic?: string | null;
  targetId?: number | null;
  targetType?: number | null;
  typeTitle?: string | null;
  url?: string | null;
};

type DjBannerBody = {
  code: 200;
  data: Array<Banner>;
};
```

| 字段                | 类型            | 必填 | 说明                         |
| ------------------- | --------------- | ---- | ---------------------------- |
| `code`              | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`              | `Array<Banner>` | 是   | 接口返回的数据主体           |
| `data[].exclusive`  | `boolean`       | 否   | -                            |
| `data[].pic`        | `string`        | 否   | -                            |
| `data[].targetId`   | `number`        | 否   | target ID                    |
| `data[].targetType` | `number`        | 否   | -                            |
| `data[].typeTitle`  | `string`        | 否   | -                            |
| `data[].url`        | `string`        | 否   | 资源访问地址                 |

<!-- api-doc:response:end -->
