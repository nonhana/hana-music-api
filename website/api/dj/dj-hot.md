---
title: '热门电台'
description: '调用此接口，可获取热门电台'
---

# 热门电台

调用此接口，可获取热门电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                     |
| ---------- | -------------------------------------- |
| 接口地址   | `/dj/hot`                              |
| 请求方式   | `GET` / `POST`                         |
| 需要登录   | 否                                     |
| 对应模块   | `dj_hot`                               |
| SDK 函数   | `djHot`（`hana-music-api/api/dj_hot`） |
| 返回体类型 | `DjHotBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djHot } from 'hana-music-api';

const result = await djHot({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/hot' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                    |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjHotBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_hot`、`hana-music-api/schemas/dj_hot` 导入运行时校验器）。

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

type DjHotBody = {
  code: 200;
  djRadios: Array<Radio>;
  hasMore?: boolean | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段       | 类型           | 必填 | 说明                         |
| ---------- | -------------- | ---- | ---------------------------- |
| `code`     | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `djRadios` | `Array<Radio>` | 是   | 电台列表                     |
| `hasMore`  | `boolean`      | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
