---
title: '广播电台 - 分类/地区信息'
description: '调用此接口，获取广播电台 - 分类/地区信息'
---

# 广播电台 - 分类/地区信息

调用此接口，获取广播电台 - 分类/地区信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                 |
| ---------- | ---------------------------------------------------------------------------------- |
| 接口地址   | `/broadcast/category/region/get`                                                   |
| 请求方式   | `GET` / `POST`                                                                     |
| 需要登录   | 否                                                                                 |
| 对应模块   | `broadcast_category_region_get`                                                    |
| SDK 函数   | `broadcastCategoryRegionGet`（`hana-music-api/api/broadcast_category_region_get`） |
| 返回体类型 | `BroadcastCategoryRegionGetBody`（已建模返回体）                                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { broadcastCategoryRegionGet } from 'hana-music-api';

const result = await broadcastCategoryRegionGet();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/broadcast/category/region/get'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`BroadcastCategoryRegionGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/broadcast_category_region_get`、`hana-music-api/schemas/broadcast_category_region_get` 导入运行时校验器）。

```ts
type Category = {
  id: number;
  name?: string | null;
};

type Region = {
  id: number;
  name?: string | null;
};

type BroadcastCategoryRegionGetBody = {
  code: 200;
  data: {
    categoryList: Array<Category>;
    regionList: Array<Region>;
  };
  message?: string | null;
};
```

| 字段                       | 类型              | 必填 | 说明                         |
| -------------------------- | ----------------- | ---- | ---------------------------- |
| `code`                     | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`                     | `object`          | 是   | 接口返回的数据主体           |
| `data.categoryList`        | `Array<Category>` | 是   | -                            |
| `data.categoryList[].id`   | `number`          | 是   | 记录 ID                      |
| `data.categoryList[].name` | `string`          | 否   | 名称                         |
| `data.regionList`          | `Array<Region>`   | 是   | -                            |
| `data.regionList[].id`     | `number`          | 是   | 记录 ID                      |
| `data.regionList[].name`   | `string`          | 否   | 名称                         |
| `message`                  | `string`          | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
