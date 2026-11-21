---
title: '获取历史日推可用日期列表'
description: '调用此接口，可获得历史日推可用日期列表'
---

# 获取历史日推可用日期列表

调用此接口，可获得历史日推可用日期列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| 接口地址   | `/history/recommend/songs`                                              |
| 请求方式   | `GET` / `POST`                                                          |
| 需要登录   | 否                                                                      |
| 对应模块   | `history_recommend_songs`                                               |
| SDK 函数   | `historyRecommendSongs`（`hana-music-api/api/history_recommend_songs`） |
| 返回体类型 | `HistoryRecommendSongsBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { historyRecommendSongs } from 'hana-music-api';

const result = await historyRecommendSongs();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/history/recommend/songs'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`HistoryRecommendSongsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/history_recommend_songs`、`hana-music-api/schemas/history_recommend_songs` 导入运行时校验器）。

```ts
type HistoryRecommendSongsBody = {
  code: 200;
  data: {
    dates: Array<string>;
    purchaseUrl?: string | null;
    description?: string | null;
    noHistoryMessage?: string | null;
  };
};
```

| 字段                    | 类型            | 必填 | 说明                         |
| ----------------------- | --------------- | ---- | ---------------------------- |
| `code`                  | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`                  | `object`        | 是   | 接口返回的数据主体           |
| `data.dates`            | `Array<string>` | 是   | -                            |
| `data.purchaseUrl`      | `string`        | 否   | 资源访问链接                 |
| `data.description`      | `string`        | 否   | 描述信息                     |
| `data.noHistoryMessage` | `string`        | 否   | -                            |

<!-- api-doc:response:end -->
