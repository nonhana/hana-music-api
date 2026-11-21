---
title: '热搜列表(详细)'
description: '调用此接口，可获取热门搜索列表'
---

# 热搜列表(详细)

调用此接口，可获取热门搜索列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/search/hot/detail`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `search_hot_detail`                                         |
| SDK 函数   | `searchHotDetail`（`hana-music-api/api/search_hot_detail`） |
| 返回体类型 | `SearchHotDetailBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { searchHotDetail } from 'hana-music-api';

const result = await searchHotDetail();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/search/hot/detail'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SearchHotDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search_hot_detail`、`hana-music-api/schemas/search_hot_detail` 导入运行时校验器）。

```ts
type HotSearchDetail = {
  searchWord: string;
  alg?: string | null;
  score?: number | null;
  content?: string | null;
  source?: number | null;
  iconType?: number | null;
  iconUrl?: string | null;
  url?: string | null;
};

type SearchHotDetailBody = {
  code: 200;
  data: Array<HotSearchDetail>;
  message?: string | null;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

| 字段                | 类型                     | 必填 | 说明                         |
| ------------------- | ------------------------ | ---- | ---------------------------- |
| `code`              | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `data`              | `Array<HotSearchDetail>` | 是   | 接口返回的数据主体           |
| `data[].searchWord` | `string`                 | 是   | 热搜关键词                   |
| `data[].alg`        | `string`                 | 否   | 推荐算法标识                 |
| `data[].score`      | `number`                 | 否   | -                            |
| `data[].content`    | `string`                 | 否   | 正文内容                     |
| `data[].source`     | `number`                 | 否   | -                            |
| `data[].iconType`   | `number`                 | 否   | -                            |
| `data[].iconUrl`    | `string`                 | 否   | 资源访问链接                 |
| `data[].url`        | `string`                 | 否   | 资源访问地址                 |
| `message`           | `string`                 | 否   | 返回说明信息                 |
| `trp`               | `object`                 | 否   | -                            |
| `trp.rules`         | `Array<string>`          | 否   | -                            |

<!-- api-doc:response:end -->
