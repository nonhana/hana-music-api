---
title: '默认搜索关键词'
description: '调用此接口，可获取默认搜索关键词'
---

# 默认搜索关键词

调用此接口，可获取默认搜索关键词

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/search/default`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `search_default`                                       |
| SDK 函数   | `searchDefault`（`hana-music-api/api/search_default`） |
| 返回体类型 | `SearchDefaultBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { searchDefault } from 'hana-music-api';

const result = await searchDefault();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/search/default'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SearchDefaultBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search_default`、`hana-music-api/schemas/search_default` 导入运行时校验器）。

```ts
type SearchDefaultData = {
  showKeyword: string;
  realkeyword: string;
  styleKeyword?: {
    keyWord?: string | null;
  } | null;
  action?: number | null;
  alg?: string | null;
  bizQueryInfo?: string | null;
  gap?: number | null;
  searchType?: number | null;
};

type SearchDefaultBody = {
  code: 200;
  data: SearchDefaultData;
};
```

| 字段                        | 类型                | 必填 | 说明                         |
| --------------------------- | ------------------- | ---- | ---------------------------- |
| `code`                      | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `data`                      | `SearchDefaultData` | 是   | 接口返回的数据主体           |
| `data.showKeyword`          | `string`            | 是   | 搜索框展示推荐词             |
| `data.realkeyword`          | `string`            | 是   | 实际触发搜索的关键词         |
| `data.styleKeyword`         | `object`            | 否   | -                            |
| `data.styleKeyword.keyWord` | `string`            | 否   | -                            |
| `data.action`               | `number`            | 否   | -                            |
| `data.alg`                  | `string`            | 否   | 推荐算法标识                 |
| `data.bizQueryInfo`         | `string`            | 否   | -                            |
| `data.gap`                  | `number`            | 否   | -                            |
| `data.searchType`           | `number`            | 否   | -                            |

<!-- api-doc:response:end -->
