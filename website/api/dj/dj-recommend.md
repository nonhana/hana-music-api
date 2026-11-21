---
title: '电台 - 推荐'
description: '登录后调用此接口，可获得推荐电台'
---

# 电台 - 推荐

登录后调用此接口，可获得推荐电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/dj/recommend`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `dj_recommend`                                     |
| SDK 函数   | `djRecommend`（`hana-music-api/api/dj_recommend`） |
| 返回体类型 | `DjRecommendBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djRecommend } from 'hana-music-api';

const result = await djRecommend({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/dj/recommend' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjRecommendBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_recommend`、`hana-music-api/schemas/dj_recommend` 导入运行时校验器）。

```ts
type Radio = {
  id: number;
  buyed?: boolean | null;
  category?: string | null;
  categoryId?: number | null;
  copywriter?: string | null;
  createTime?: number | null;
  dj?: PlaylistUser | null;
  feeScope?: number | null;
  name?: string | null;
  picUrl?: string | null;
  playCount?: number | null;
  programCount?: number | null;
  radioFeeType?: number | null;
  rcmdtext?: string | null;
  subCount?: number | null;
  subed?: boolean | null;
};

type DjRecommendBody = {
  code: 200;
  djRadios: Array<Radio>;
  name?: string | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段       | 类型           | 必填 | 说明                         |
| ---------- | -------------- | ---- | ---------------------------- |
| `code`     | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `djRadios` | `Array<Radio>` | 是   | 电台列表                     |
| `name`     | `string`       | 否   | 名称                         |

<!-- api-doc:response:end -->
