---
title: '独家放送(入口列表)'
description: '调用此接口，可获取独家放送'
---

# 独家放送(入口列表)

调用此接口，可获取独家放送

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                               |
| ---------- | -------------------------------------------------------------------------------- |
| 接口地址   | `/personalized/privatecontent`                                                   |
| 请求方式   | `GET` / `POST`                                                                   |
| 需要登录   | 否                                                                               |
| 对应模块   | `personalized_privatecontent`                                                    |
| SDK 函数   | `personalizedPrivatecontent`（`hana-music-api/api/personalized_privatecontent`） |
| 返回体类型 | `PersonalizedPrivatecontentBody`（已建模返回体）                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalizedPrivatecontent } from 'hana-music-api';

const result = await personalizedPrivatecontent();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/personalized/privatecontent'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalizedPrivatecontentBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personalized_privatecontent`、`hana-music-api/schemas/personalized_privatecontent` 导入运行时校验器）。

```ts
type Privatecontent = {
  id: number;
  alg?: string | null;
  copywriter?: string | null;
  name?: string | null;
  picUrl?: string | null;
  sPicUrl?: string | null;
  type?: number | null;
  url?: string | null;
};

type PersonalizedPrivatecontentBody = {
  code: 200;
  result: Array<Privatecontent>;
  name?: string | null;
};
```

| 字段                  | 类型                    | 必填 | 说明                         |
| --------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `result`              | `Array<Privatecontent>` | 是   | 接口返回的结果主体           |
| `result[].id`         | `number`                | 是   | 记录 ID                      |
| `result[].alg`        | `string`                | 否   | 推荐算法标识                 |
| `result[].copywriter` | `string`                | 否   | -                            |
| `result[].name`       | `string`                | 否   | 名称                         |
| `result[].picUrl`     | `string`                | 否   | 资源访问链接                 |
| `result[].sPicUrl`    | `string`                | 否   | 资源访问链接                 |
| `result[].type`       | `number`                | 否   | -                            |
| `result[].url`        | `string`                | 否   | 资源访问地址                 |
| `name`                | `string`                | 否   | 名称                         |

<!-- api-doc:response:end -->
