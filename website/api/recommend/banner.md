---
title: 'banner'
description: '调用此接口，可获取 banner( 轮播图 ) 数据'
---

# banner

调用此接口，可获取 banner( 轮播图 ) 数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                      |
| ---------- | --------------------------------------- |
| 接口地址   | `/banner`                               |
| 请求方式   | `GET` / `POST`                          |
| 需要登录   | 否                                      |
| 对应模块   | `banner`                                |
| SDK 函数   | `banner`（`hana-music-api/api/banner`） |
| 返回体类型 | `BannerBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { banner } from 'hana-music-api';

const result = await banner({
  type: 0,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/banner' \
  --data-urlencode 'type=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                                                                  |
| ------ | ------------------ | ---- | ------ | ------------------------------------------------------------------------------------- |
| `type` | `0 \| 1 \| 2 \| 3` | 否   | `0`    | 资源类型，对应以下类型，默认为 0 即 PC<br>0: pc<br>1: android<br>2: iphone<br>3: ipad |

| `type` | 客户端类型 |
| ------ | ---------- |
| `0`    | PC（默认） |
| `1`    | Android    |
| `2`    | iPhone     |
| `3`    | iPad       |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`BannerBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/banner`、`hana-music-api/schemas/banner` 导入运行时校验器）。

```ts
type Banner = {
  targetId?: number | null;
  targetType?: number | null;
  typeTitle?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  bigImageUrl?: string | null;
  bannerId?: string | null;
  pic?: string | null;
  encodeId?: string | null;
  titleColor?: string | null;
  bannerBizType?: string | null;
  exclusive?: boolean | null;
  showAdTag?: boolean | null;
  alg?: string | null;
  scm?: string | null;
  requestId?: string | null;
  s_ctrp?: string | null;
  song?: LooseSong | null;
};

type BannerBody = {
  code: 200;
  banners: Array<Banner>;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)

| 字段        | 类型            | 必填 | 说明                         |
| ----------- | --------------- | ---- | ---------------------------- |
| `code`      | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `banners`   | `Array<Banner>` | 是   | 轮播 Banner 列表             |
| `trp`       | `object`        | 否   | -                            |
| `trp.rules` | `Array<string>` | 否   | -                            |

<!-- api-doc:response:end -->
