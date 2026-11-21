---
title: '电台 - 节目榜'
description: '登录后调用此接口，可获得电台节目榜'
---

# 电台 - 节目榜

登录后调用此接口，可获得电台节目榜

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/dj/program/toplist`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 是                                                            |
| 对应模块   | `dj_program_toplist`                                          |
| SDK 函数   | `djProgramToplist`（`hana-music-api/api/dj_program_toplist`） |
| 返回体类型 | `DjProgramToplistBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djProgramToplist } from 'hana-music-api';

const result = await djProgramToplist(
  {
    limit: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/program/toplist' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                      |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `100`  | 返回数量，默认为 100                                                      |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*100，其中 100 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjProgramToplistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_program_toplist`、`hana-music-api/schemas/dj_program_toplist` 导入运行时校验器）。

```ts
type ToplistEntry = {
  program: DjProgram;
  lastRank?: number | null;
  programFeeType?: number | null;
  rank?: number | null;
  score?: number | null;
};

type DjProgramToplistBody = {
  code: 200;
  toplist: Array<ToplistEntry>;
  updateTime?: number | null;
};
```

- **公共类型**：[DjProgram](/api/shared-types#djprogram)

| 字段                       | 类型                                     | 必填 | 说明                         |
| -------------------------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`                     | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `toplist`                  | `Array<ToplistEntry>`                    | 是   | 排行榜列表                   |
| `toplist[].program`        | [DjProgram](/api/shared-types#djprogram) | 是   | 电台节目详情                 |
| `toplist[].lastRank`       | `number`                                 | 否   | -                            |
| `toplist[].programFeeType` | `number`                                 | 否   | -                            |
| `toplist[].rank`           | `number`                                 | 否   | -                            |
| `toplist[].score`          | `number`                                 | 否   | -                            |
| `updateTime`               | `number`                                 | 否   | 时间戳                       |

<!-- api-doc:response:end -->
