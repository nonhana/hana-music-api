---
title: '推荐电台'
description: '调用此接口，可获取推荐电台'
---

# 推荐电台

调用此接口，可获取推荐电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 接口地址   | `/personalized/djprogram`                                              |
| 请求方式   | `GET` / `POST`                                                         |
| 需要登录   | 否                                                                     |
| 对应模块   | `personalized_djprogram`                                               |
| SDK 函数   | `personalizedDjprogram`（`hana-music-api/api/personalized_djprogram`） |
| 返回体类型 | `PersonalizedDjprogramBody`（已建模返回体）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalizedDjprogram } from 'hana-music-api';

const result = await personalizedDjprogram();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/personalized/djprogram'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalizedDjprogramBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personalized_djprogram`、`hana-music-api/schemas/personalized_djprogram` 导入运行时校验器）。

```ts
type Radio = {
  buyed?: boolean | null;
  category?: string | null;
  categoryId?: number | null;
  composeVideo?: boolean | null;
  createTime?: number | null;
  desc?: string | null;
  feeScope?: number | null;
  finished?: boolean | null;
  hightQuality?: boolean | null;
  id?: number | null;
  lastProgramCreateTime?: number | null;
  lastProgramId?: number | null;
  name?: string | null;
  originalPrice?: number | null;
  picId?: number | null;
  picUrl?: string | null;
  price?: number | null;
  programCount?: number | null;
  purchaseCount?: number | null;
  radioFeeType?: number | null;
  rcmdText?: string | null;
  subCount?: number | null;
  subed?: boolean | null;
  underShelf?: boolean | null;
  whiteList?: boolean | null;
};

type RecommendedProgram = {
  adjustedPlayCount?: number | null;
  auditStatus?: number | null;
  bdAuditStatus?: number | null;
  blurCoverUrl?: string | null;
  buyed?: boolean | null;
  canReward?: boolean | null;
  channels?: Array<string> | null;
  commentCount?: number | null;
  commentThreadId?: string | null;
  coverId?: number | null;
  coverUrl?: string | null;
  createTime?: number | null;
  description?: string | null;
  dj?: ProgramDj | null;
  duration?: number | null;
  id?: number | null;
  isPublish?: boolean | null;
  likedCount?: number | null;
  listenerCount?: number | null;
  mainSong?: ProgramMainSong | null;
  mainTrackId?: number | null;
  name?: string | null;
  programFeeType?: number | null;
  pubStatus?: number | null;
  publish?: boolean | null;
  radio?: Radio | null;
  reward?: boolean | null;
  serialNum?: number | null;
  shareCount?: number | null;
  subscribed?: boolean | null;
  subscribedCount?: number | null;
  trackCount?: number | null;
  userId?: number | null;
};

type RecommendItem = {
  id: number;
  alg?: string | null;
  canDislike?: boolean | null;
  copywriter?: string | null;
  name?: string | null;
  picUrl?: string | null;
  program?: RecommendedProgram | null;
  type?: number | null;
};

type PersonalizedDjprogramBody = {
  code: 200;
  result: Array<RecommendItem>;
  category?: number | null;
};
```

- **公共类型**：[ProgramDj](/api/shared-types#programdj)、[ProgramMainSong](/api/shared-types#programmainsong)

| 字段                  | 类型                   | 必填 | 说明                         |
| --------------------- | ---------------------- | ---- | ---------------------------- |
| `code`                | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `result`              | `Array<RecommendItem>` | 是   | 接口返回的结果主体           |
| `result[].id`         | `number`               | 是   | 记录 ID                      |
| `result[].alg`        | `string`               | 否   | 推荐算法标识                 |
| `result[].canDislike` | `boolean`              | 否   | -                            |
| `result[].copywriter` | `string`               | 否   | -                            |
| `result[].name`       | `string`               | 否   | 名称                         |
| `result[].picUrl`     | `string`               | 否   | 资源访问链接                 |
| `result[].program`    | `RecommendedProgram`   | 否   | 电台节目详情                 |
| `result[].type`       | `number`               | 否   | -                            |
| `category`            | `number`               | 否   | -                            |

<!-- api-doc:response:end -->
