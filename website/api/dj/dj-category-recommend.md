---
title: '电台 - 推荐类型'
description: '登录后调用此接口，可获得电台推荐类型'
---

# 电台 - 推荐类型

登录后调用此接口，可获得电台推荐类型

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/dj/category/recommend`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 是                                                                  |
| 对应模块   | `dj_category_recommend`                                             |
| SDK 函数   | `djCategoryRecommend`（`hana-music-api/api/dj_category_recommend`） |
| 返回体类型 | `DjCategoryRecommendBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djCategoryRecommend } from 'hana-music-api';

const result = await djCategoryRecommend({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/dj/category/recommend' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjCategoryRecommendBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_category_recommend`、`hana-music-api/schemas/dj_category_recommend` 导入运行时校验器）。

```ts
type RadioIcon = {
  color?: string | null;
  type?: string | null;
  value?: string | null;
};

type Radio = {
  id: number;
  alg?: string | null;
  feeScope?: number | null;
  icon?: RadioIcon | null;
  lastProgramName?: string | null;
  name?: string | null;
  picUrl?: string | null;
  playCount?: number | null;
  programCount?: number | null;
  radioFeeType?: number | null;
  rcmdText?: string | null;
  subCount?: number | null;
  subed?: boolean | null;
};

type Category = {
  categoryId: number;
  categoryName?: string | null;
  radios: Array<Radio>;
};

type DjCategoryRecommendBody = {
  code: 200;
  data: Array<Category>;
};
```

| 字段                  | 类型              | 必填 | 说明                         |
| --------------------- | ----------------- | ---- | ---------------------------- |
| `code`                | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`                | `Array<Category>` | 是   | 接口返回的数据主体           |
| `data[].categoryId`   | `number`          | 是   | category ID                  |
| `data[].categoryName` | `string`          | 否   | -                            |
| `data[].radios`       | `Array<Radio>`    | 是   | -                            |

<!-- api-doc:response:end -->
