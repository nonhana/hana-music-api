---
title: 'batch 批量请求接口'
description: '以 `/api/*` 路径为键批量转发多个上游子请求，并在同一次响应中返回各路由结果。'
---

# batch 批量请求接口

以 `/api/*` 路径为键批量转发多个上游子请求，并在同一次响应中返回各路由结果。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                    |
| ---------- | ------------------------------------- |
| 接口地址   | `/batch`                              |
| 请求方式   | `GET` / `POST`                        |
| 需要登录   | 是                                    |
| 对应模块   | `batch`                               |
| SDK 函数   | `batch`（`hana-music-api/api/batch`） |
| 返回体类型 | `UnknownJson`（未建模接口）           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { batch } from 'hana-music-api';

const result = await batch(
  {
    '/api/v2/banner/get': { clientType: 'pc' },
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/batch' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"/api/v2/banner/get":{"clientType":"pc"}}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                      | 必填 | 默认值 | 说明                                                            |
| -------- | ------------------------- | ---- | ------ | --------------------------------------------------------------- |
| `/api/*` | `Record<string, unknown>` | 否   | -      | 以 `/api/` 开头的目标上游子路由键，值为传给对应子接口的参数对象 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`。返回对象以各个请求的 `/api/*` 子路由为键，对应子请求的上游响应结果。

<!-- api-doc:response:end -->

## 注意事项

- **子请求格式**：传入对象中所有以 `/api/` 开头的键都会作为子路由转发至上游（如 `"/api/v2/banner/get": { clientType: "pc" }`），每个值必须是对象参数字典。
