---
title: '电台 - 付费精品'
description: '调用此接口，可获取付费精品电台'
---

# 电台 - 付费精品

调用此接口，可获取付费精品电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                    |
| ---------- | ----------------------------------------------------- |
| 接口地址   | `/dj/toplist/pay`                                     |
| 请求方式   | `GET` / `POST`                                        |
| 需要登录   | 否                                                    |
| 对应模块   | `dj_toplist_pay`                                      |
| SDK 函数   | `djToplistPay`（`hana-music-api/api/dj_toplist_pay`） |
| 返回体类型 | `DjToplistPayBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djToplistPay } from 'hana-music-api';

const result = await djToplistPay({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/toplist/pay' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                                 |
| ------- | -------- | ---- | ------ | ------------------------------------ |
| `limit` | `number` | 否   | `100`  | 返回数量，默认为 100 (不支持 offset) |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjToplistPayBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_toplist_pay`、`hana-music-api/schemas/dj_toplist_pay` 导入运行时校验器）。

```ts
type PaidRadio = {
  id: number;
  creatorName?: string | null;
  lastRank?: number | null;
  name?: string | null;
  picUrl?: string | null;
  rank?: number | null;
  score?: number | null;
};

type DjToplistPayBody = {
  code: 200;
  data: {
    total?: number | null;
    updateTime?: number | null;
    list: Array<PaidRadio>;
  };
};
```

| 字段                      | 类型               | 必填 | 说明                         |
| ------------------------- | ------------------ | ---- | ---------------------------- |
| `code`                    | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`                    | `object`           | 是   | 接口返回的数据主体           |
| `data.total`              | `number`           | 否   | 总条目数                     |
| `data.updateTime`         | `number`           | 否   | 时间戳                       |
| `data.list`               | `Array<PaidRadio>` | 是   | 结果条目列表                 |
| `data.list[].id`          | `number`           | 是   | 记录 ID                      |
| `data.list[].creatorName` | `string`           | 否   | -                            |
| `data.list[].lastRank`    | `number`           | 否   | -                            |
| `data.list[].name`        | `string`           | 否   | 名称                         |
| `data.list[].picUrl`      | `string`           | 否   | 资源访问链接                 |
| `data.list[].rank`        | `number`           | 否   | -                            |
| `data.list[].score`       | `number`           | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **分页限制**：上游接口不支持 `offset` 参数，仅支持通过 `limit` 控制返回条数。
