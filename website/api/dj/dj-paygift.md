---
title: '电台 - 付费精选'
description: '可以获取付费精选的电台列表，传入 `limit` 和 `offset` 可以进行分页'
---

# 电台 - 付费精选

可以获取付费精选的电台列表，传入 `limit` 和 `offset` 可以进行分页

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/dj/paygift`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `dj_paygift`                                   |
| SDK 函数   | `djPaygift`（`hana-music-api/api/dj_paygift`） |
| 返回体类型 | `DjPaygiftBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djPaygift } from 'hana-music-api';

const result = await djPaygift({
  limit: 10,
  offset: 20,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/paygift' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'offset=20'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                    |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjPaygiftBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_paygift`、`hana-music-api/schemas/dj_paygift` 导入运行时校验器）。

```ts
type PaidRadio = {
  id: number;
  alg?: string | null;
  discountPrice?: number | null;
  feeScope?: number | null;
  lastProgramName?: string | null;
  name?: string | null;
  originalPrice?: number | null;
  picUrl?: string | null;
  programCount?: number | null;
  radioFeeType?: number | null;
  rcmdText?: string | null;
  subCount?: number | null;
  subed?: boolean | null;
};

type PaidRadioPage = {
  list: Array<PaidRadio>;
  hasMore?: boolean | null;
};

type DjPaygiftBody = {
  code: 200;
  data: PaidRadioPage;
};
```

| 字段           | 类型               | 必填 | 说明                         |
| -------------- | ------------------ | ---- | ---------------------------- |
| `code`         | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `PaidRadioPage`    | 是   | 接口返回的数据主体           |
| `data.list`    | `Array<PaidRadio>` | 是   | 结果条目列表                 |
| `data.hasMore` | `boolean`          | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
