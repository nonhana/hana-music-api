---
title: '电台个性推荐'
description: '调用此接口，可获取电台个性推荐列表'
---

# 电台个性推荐

调用此接口，可获取电台个性推荐列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| 接口地址   | `/dj/personalize/recommend`                                               |
| 请求方式   | `GET` / `POST`                                                            |
| 需要登录   | 否                                                                        |
| 对应模块   | `dj_personalize_recommend`                                                |
| SDK 函数   | `djPersonalizeRecommend`（`hana-music-api/api/dj_personalize_recommend`） |
| 返回体类型 | `DjPersonalizeRecommendBody`（已建模返回体）                              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djPersonalizeRecommend } from 'hana-music-api';

const result = await djPersonalizeRecommend({
  limit: 5,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/personalize/recommend' \
  --data-urlencode 'limit=5'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                                |
| ------- | -------- | ---- | ------ | ----------------------------------- |
| `limit` | `number` | 否   | `6`    | 返回数量，默认为 6，总条数最多 6 条 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjPersonalizeRecommendBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_personalize_recommend`、`hana-music-api/schemas/dj_personalize_recommend` 导入运行时校验器）。

```ts
type Radio = {
  id: number;
  alg?: string | null;
  buyed?: boolean | null;
  category?: string | null;
  categoryId?: number | null;
  composeVideo?: boolean | null;
  createTime?: number | null;
  danmakuCount?: number | null;
  deleted?: boolean | null;
  desc?: string | null;
  dj?: ProgramDj | null;
  dynamic?: boolean | null;
  feeScope?: number | null;
  finished?: boolean | null;
  hightQuality?: boolean | null;
  intervenePicId?: number | null;
  intervenePicUrl?: string | null;
  lastProgramCreateTime?: number | null;
  lastProgramId?: number | null;
  lastProgramName?: string | null;
  lastUpdateProgramName?: string | null;
  name?: string | null;
  onlySelfSee?: boolean | null;
  original?: string | null;
  originalPrice?: number | null;
  picId?: number | null;
  picUrl?: string | null;
  playCount?: number | null;
  price?: number | null;
  privacy?: boolean | null;
  programCount?: number | null;
  programOrder?: number | null;
  purchaseCount?: number | null;
  radioFeeType?: number | null;
  rcmdText?: string | null;
  rcmdtext?: string | null;
  secondCategory?: string | null;
  secondCategoryId?: number | null;
  specialType?: number | null;
  subCount?: number | null;
  subed?: boolean | null;
  taskId?: number | null;
  underShelf?: boolean | null;
  userDeleted?: boolean | null;
  whiteList?: boolean | null;
};

type DjPersonalizeRecommendBody = {
  code: 200;
  data: Array<Radio>;
};
```

- **公共类型**：[ProgramDj](/api/shared-types#programdj)

| 字段   | 类型           | 必填 | 说明                         |
| ------ | -------------- | ---- | ---------------------------- |
| `code` | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `data` | `Array<Radio>` | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
