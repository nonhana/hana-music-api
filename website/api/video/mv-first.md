---
title: '最新 mv'
description: '调用此接口，可获取最新 mv'
---

# 最新 mv

调用此接口，可获取最新 mv

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/mv/first`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 否                                         |
| 对应模块   | `mv_first`                                 |
| SDK 函数   | `mvFirst`（`hana-music-api/api/mv_first`） |
| 返回体类型 | `MvFirstBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvFirst } from 'hana-music-api';

const result = await mvFirst({
  limit: 10,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/first' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                                                           |
| ------- | -------- | ---- | ------ | -------------------------------------------------------------- |
| `area`  | `string` | 否   | ``     | 地区，可选值为全部，内地，港台，欧美，日本，韩国，不填则为全部 |
| `limit` | `number` | 否   | `30`   | 返回条目数量                                                   |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvFirstBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_first`、`hana-music-api/schemas/mv_first` 导入运行时校验器）。

```ts
type MvFirstBody = {
  code: 200;
  data: Array<MvSummary>;
};
```

- **公共类型**：[MvSummary](/api/shared-types#mvsummary)

| 字段   | 类型                                              | 必填 | 说明                         |
| ------ | ------------------------------------------------- | ---- | ---------------------------- |
| `code` | `200`                                             | 是   | 业务状态码（`200` 表示成功） |
| `data` | Array\<[MvSummary](/api/shared-types#mvsummary)\> | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
