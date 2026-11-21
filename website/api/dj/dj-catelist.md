---
title: '电台 - 分类'
description: '登录后调用此接口，可获得电台类型'
---

# 电台 - 分类

登录后调用此接口，可获得电台类型

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/dj/catelist`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `dj_catelist`                                    |
| SDK 函数   | `djCatelist`（`hana-music-api/api/dj_catelist`） |
| 返回体类型 | `DjCatelistBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djCatelist } from 'hana-music-api';

const result = await djCatelist({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/dj/catelist' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjCatelistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_catelist`、`hana-music-api/schemas/dj_catelist` 导入运行时校验器）。

```ts
type Category = {
  id: number;
  name?: string | null;
  pic56x56Id?: number | null;
  pic56x56IdStr?: string | null;
  pic56x56Url?: string | null;
  pic84x84Id?: number | null;
  pic84x84IdUrl?: string | null;
  pic96x96Id?: number | null;
  pic96x96IdStr?: string | null;
  pic96x96Url?: string | null;
  picIPad?: number | null;
  picIPadStr?: string | null;
  picIPadUrl?: string | null;
  picMacId?: string | null;
  picMacUrl?: string | null;
  picPCBlack?: number | null;
  picPCBlackStr?: string | null;
  picPCBlackUrl?: string | null;
  picPCWhite?: number | null;
  picPCWhiteStr?: string | null;
  picPCWhiteUrl?: string | null;
  picUWPId?: string | null;
  picUWPUrl?: string | null;
  picWeb?: number | null;
  picWebStr?: string | null;
  picWebUrl?: string | null;
};

type DjCatelistBody = {
  code: 200;
  categories: Array<Category>;
};
```

| 字段         | 类型              | 必填 | 说明                         |
| ------------ | ----------------- | ---- | ---------------------------- |
| `code`       | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `categories` | `Array<Category>` | 是   | -                            |

<!-- api-doc:response:end -->
