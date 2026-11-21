---
title: '热搜列表(简略)'
description: '调用此接口，可获取热门搜索列表'
---

# 热搜列表(简略)

调用此接口，可获取热门搜索列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/search/hot`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `search_hot`                                   |
| SDK 函数   | `searchHot`（`hana-music-api/api/search_hot`） |
| 返回体类型 | `SearchHotBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { searchHot } from 'hana-music-api';

const result = await searchHot();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/search/hot'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SearchHotBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search_hot`、`hana-music-api/schemas/search_hot` 导入运行时校验器）。

```ts
type HotSearch = {
  first: string;
  second?: number | null;
  iconType?: number | null;
};

type SearchHotBody = {
  code: 200;
  result: {
    hots: Array<HotSearch>;
  };
};
```

| 字段                     | 类型               | 必填 | 说明                         |
| ------------------------ | ------------------ | ---- | ---------------------------- |
| `code`                   | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `result`                 | `object`           | 是   | 接口返回的结果主体           |
| `result.hots`            | `Array<HotSearch>` | 是   | 热搜词列表                   |
| `result.hots[].first`    | `string`           | 是   | 热搜关键词                   |
| `result.hots[].second`   | `number`           | 否   | -                            |
| `result.hots[].iconType` | `number`           | 否   | -                            |

<!-- api-doc:response:end -->
