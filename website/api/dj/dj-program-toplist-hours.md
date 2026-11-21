---
title: '电台 - 24 小时节目榜'
description: '调用此接口，可获取 24 小时节目榜'
---

# 电台 - 24 小时节目榜

调用此接口，可获取 24 小时节目榜

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| 接口地址   | `/dj/program/toplist/hours`                                              |
| 请求方式   | `GET` / `POST`                                                           |
| 需要登录   | 否                                                                       |
| 对应模块   | `dj_program_toplist_hours`                                               |
| SDK 函数   | `djProgramToplistHours`（`hana-music-api/api/dj_program_toplist_hours`） |
| 返回体类型 | `DjProgramToplistHoursBody`（已建模返回体）                              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djProgramToplistHours } from 'hana-music-api';

const result = await djProgramToplistHours({
  limit: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/program/toplist/hours' \
  --data-urlencode 'limit=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                                 |
| ------- | -------- | ---- | ------ | ------------------------------------ |
| `limit` | `number` | 否   | `100`  | 返回数量，默认为 100 (不支持 offset) |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjProgramToplistHoursBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_program_toplist_hours`、`hana-music-api/schemas/dj_program_toplist_hours` 导入运行时校验器）。

```ts
type ToplistEntry = {
  program: DjProgram;
  lastRank?: number | null;
  programFeeType?: number | null;
  rank?: number | null;
  score?: number | null;
};

type DjProgramToplistHoursBody = {
  code: 200;
  data: {
    list: Array<ToplistEntry>;
    total?: number | null;
    updateTime?: number | null;
  };
};
```

- **公共类型**：[DjProgram](/api/shared-types#djprogram)

| 字段                         | 类型                                     | 必填 | 说明                         |
| ---------------------------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`                       | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                       | `object`                                 | 是   | 接口返回的数据主体           |
| `data.list`                  | `Array<ToplistEntry>`                    | 是   | 结果条目列表                 |
| `data.list[].program`        | [DjProgram](/api/shared-types#djprogram) | 是   | 电台节目详情                 |
| `data.list[].lastRank`       | `number`                                 | 否   | -                            |
| `data.list[].programFeeType` | `number`                                 | 否   | -                            |
| `data.list[].rank`           | `number`                                 | 否   | -                            |
| `data.list[].score`          | `number`                                 | 否   | -                            |
| `data.total`                 | `number`                                 | 否   | 总条目数                     |
| `data.updateTime`            | `number`                                 | 否   | 时间戳                       |

<!-- api-doc:response:end -->
