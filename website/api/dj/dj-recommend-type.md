---
title: '电台 - 分类推荐'
description: '登录后调用此接口，传入分类，可获得对应类型电台列表'
---

# 电台 - 分类推荐

登录后调用此接口，传入分类，可获得对应类型电台列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/dj/recommend/type`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 是                                                          |
| 对应模块   | `dj_recommend_type`                                         |
| SDK 函数   | `djRecommendType`（`hana-music-api/api/dj_recommend_type`） |
| 返回体类型 | `DjRecommendTypeBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djRecommendType } from 'hana-music-api';

const result = await djRecommendType(
  {
    type: '1',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/recommend/type' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'type=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                                 |
| ------ | ------------------ | ---- | ------ | ---------------------------------------------------- |
| `type` | `number \| string` | 是   | -      | 电台类型，数字，可通过`/dj/catelist`获取，对应关系为 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjRecommendTypeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_recommend_type`、`hana-music-api/schemas/dj_recommend_type` 导入运行时校验器）。

```ts
type DescText = {
  text?: string | null;
};

type DescNestedData = {
  textList?: Array<DescText> | null;
};

type DescPic = {
  content?: string | null;
  height?: number | null;
  id?: number | null;
  nestedData?: DescNestedData | null;
  type?: number | null;
  width?: number | null;
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
  lastUpdateProgramName?: string | null;
  name?: string | null;
  originalPrice?: number | null;
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

type DjRecommendTypeBody = {
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
