---
title: '独家放送列表'
description: '调用此接口，可获取独家放送列表'
---

# 独家放送列表

调用此接口，可获取独家放送列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------- |
| 接口地址   | `/personalized/privatecontent/list`                                                       |
| 请求方式   | `GET` / `POST`                                                                            |
| 需要登录   | 否                                                                                        |
| 对应模块   | `personalized_privatecontent_list`                                                        |
| SDK 函数   | `personalizedPrivatecontentList`（`hana-music-api/api/personalized_privatecontent_list`） |
| 返回体类型 | `PersonalizedPrivatecontentListBody`（已建模返回体）                                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { personalizedPrivatecontentList } from 'hana-music-api';

const result = await personalizedPrivatecontentList({
  limit: 1,
  offset: 2,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/personalized/privatecontent/list' \
  --data-urlencode 'limit=1' \
  --data-urlencode 'offset=2'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                    |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `60`   | 返回数量，默认为 60                                                     |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*60，其中 60 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PersonalizedPrivatecontentListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/personalized_privatecontent_list`、`hana-music-api/schemas/personalized_privatecontent_list` 导入运行时校验器）。

```ts
type PrivatecontentListItem = {
  id: number;
  copywriter?: string | null;
  name?: string | null;
  picUrl?: string | null;
  sPicUrl?: string | null;
  time?: number | null;
  type?: number | null;
  url?: string | null;
};

type PersonalizedPrivatecontentListBody = {
  code: 200;
  result: Array<PrivatecontentListItem>;
  more?: boolean | null;
  offset?: number | null;
};
```

| 字段                  | 类型                            | 必填 | 说明                         |
| --------------------- | ------------------------------- | ---- | ---------------------------- |
| `code`                | `200`                           | 是   | 业务状态码（`200` 表示成功） |
| `result`              | `Array<PrivatecontentListItem>` | 是   | 接口返回的结果主体           |
| `result[].id`         | `number`                        | 是   | 记录 ID                      |
| `result[].copywriter` | `string`                        | 否   | -                            |
| `result[].name`       | `string`                        | 否   | 名称                         |
| `result[].picUrl`     | `string`                        | 否   | 资源访问链接                 |
| `result[].sPicUrl`    | `string`                        | 否   | 资源访问链接                 |
| `result[].time`       | `number`                        | 否   | 时间戳                       |
| `result[].type`       | `number`                        | 否   | -                            |
| `result[].url`        | `string`                        | 否   | 资源访问地址                 |
| `more`                | `boolean`                       | 否   | 是否还有更多数据             |
| `offset`              | `number`                        | 否   | -                            |

<!-- api-doc:response:end -->
