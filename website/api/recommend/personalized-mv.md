---
title: '推荐 mv'
description: '调用此接口，可获取推荐 mv'
---

# 推荐 mv

调用此接口，可获取推荐 mv

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/personalized/mv`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 否                                                       |
| 对应模块   | `personalized_mv`                                        |
| SDK 函数   | `personalizedMv`（`hana-music-api/api/personalized_mv`） |
| 返回体类型 | `PersonalizedMvBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalizedMv } from 'hana-music-api';

const result = await personalizedMv();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/personalized/mv'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalizedMvBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personalized_mv`、`hana-music-api/schemas/personalized_mv` 导入运行时校验器）。

```ts
type RecommendedMv = Omit<
  MvSummary,
  'alg' | 'canDislike' | 'copywriter' | 'picUrl' | 'type'
> & {
  alg?: string | null;
  canDislike?: boolean | null;
  copywriter?: string | null;
  picUrl?: string | null;
  type?: number | null;
};

type PersonalizedMvBody = {
  code: 200;
  result: Array<RecommendedMv>;
  category?: number | null;
};
```

- **公共类型**：[MvSummary](/api/shared-types#mvsummary)

| 字段                  | 类型                   | 必填 | 说明                         |
| --------------------- | ---------------------- | ---- | ---------------------------- |
| `code`                | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `result`              | `Array<RecommendedMv>` | 是   | 接口返回的结果主体           |
| `result[].alg`        | `string`               | 否   | 推荐算法标识                 |
| `result[].canDislike` | `boolean`              | 否   | -                            |
| `result[].copywriter` | `string`               | 否   | -                            |
| `result[].picUrl`     | `string`               | 否   | 资源访问链接                 |
| `result[].type`       | `number`               | 否   | -                            |
| `category`            | `number`               | 否   | -                            |

<!-- api-doc:response:end -->
