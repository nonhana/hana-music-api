---
title: '电台 - 类别热门电台'
description: '电台 - 类别热门电台 接口文档。'
---

# 电台 - 类别热门电台

电台 - 类别热门电台 接口文档。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                |
| ---------- | ------------------------------------------------- |
| 接口地址   | `/dj/radio/hot`                                   |
| 请求方式   | `GET` / `POST`                                    |
| 需要登录   | 否                                                |
| 对应模块   | `dj_radio_hot`                                    |
| SDK 函数   | `djRadioHot`（`hana-music-api/api/dj_radio_hot`） |
| 返回体类型 | `DjRadioHotBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djRadioHot } from 'hana-music-api';

const result = await djRadioHot({
  cateId: '2001',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/radio/hot' \
  --data-urlencode 'cateId=2001'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                    |
| -------- | ------------------ | ---- | ------ | ----------------------------------------------------------------------- |
| `cateId` | `number \| string` | 是   | -      | 类别 id，可通过 `/dj/category/recommend` 接口获取                       |
| `limit`  | `number`           | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjRadioHotBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_radio_hot`、`hana-music-api/schemas/dj_radio_hot` 导入运行时校验器）。

```ts
type DescText = {
  text?: string | null;
};

type DescNestedData = {
  textList?: Array<DescText> | null;
};

type DescPic = {
  content?: string | null;
  id?: number | null;
  nestedData?: DescNestedData | null;
  type?: number | null;
};

type Radio = {
  id: number;
  buyed?: boolean | null;
  category?: string | null;
  categoryId?: number | null;
  createTime?: number | null;
  desc?: string | null;
  descPicList?: Array<DescPic> | null;
  dj?: PlaylistUser | null;
  dynamic?: boolean | null;
  feeScope?: number | null;
  finished?: boolean | null;
  intervenePicId?: number | null;
  intervenePicUrl?: string | null;
  lastProgramCreateTime?: number | null;
  lastProgramId?: number | null;
  lastProgramName?: string | null;
  name?: string | null;
  operateUidList?: Array<number> | null;
  originalPrice?: number | null;
  participateUidList?: Array<number> | null;
  picId?: number | null;
  picUrl?: string | null;
  playCount?: number | null;
  price?: number | null;
  privacy?: boolean | null;
  programCount?: number | null;
  purchaseCount?: number | null;
  radioFeeType?: number | null;
  rcmdtext?: string | null;
  replaceRadioId?: number | null;
  secondCategory?: string | null;
  subCount?: number | null;
  subed?: boolean | null;
  taskId?: number | null;
  underShelf?: boolean | null;
};

type DjRadioHotBody = {
  code: 200;
  count?: number | null;
  djRadios: Array<Radio>;
  hasMore?: boolean | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段       | 类型           | 必填 | 说明                         |
| ---------- | -------------- | ---- | ---------------------------- |
| `code`     | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `count`    | `number`       | 否   | 条目总数                     |
| `djRadios` | `Array<Radio>` | 是   | 电台列表                     |
| `hasMore`  | `boolean`      | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
