---
title: '电台 - 主播新人榜'
description: '调用此接口，可获取主播新人榜'
---

# 电台 - 主播新人榜

调用此接口，可获取主播新人榜

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/dj/toplist/newcomer`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 否                                                              |
| 对应模块   | `dj_toplist_newcomer`                                           |
| SDK 函数   | `djToplistNewcomer`（`hana-music-api/api/dj_toplist_newcomer`） |
| 返回体类型 | `DjToplistNewcomerBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djToplistNewcomer } from 'hana-music-api';

const result = await djToplistNewcomer({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/toplist/newcomer' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                 |
| -------- | -------- | ---- | ------ | ------------------------------------ |
| `limit`  | `number` | 否   | `100`  | 返回数量，默认为 100 (不支持 offset) |
| `offset` | `number` | 否   | `0`    | 偏移数量（上游接口通常会忽略该参数） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjToplistNewcomerBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_toplist_newcomer`、`hana-music-api/schemas/dj_toplist_newcomer` 导入运行时校验器）。

```ts
type DjToplistNewcomerBody = {
  code: 200;
  data: {
    total?: number | null;
    updateTime?: number | null;
    list: Array<DjAnchorRank>;
  };
};
```

- **公共类型**：[DjAnchorRank](/api/shared-types#djanchorrank)

| 字段              | 类型                                                    | 必填 | 说明                         |
| ----------------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`            | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `data`            | `object`                                                | 是   | 接口返回的数据主体           |
| `data.total`      | `number`                                                | 否   | 总条目数                     |
| `data.updateTime` | `number`                                                | 否   | 时间戳                       |
| `data.list`       | Array\<[DjAnchorRank](/api/shared-types#djanchorrank)\> | 是   | 结果条目列表                 |

<!-- api-doc:response:end -->

## 注意事项

- **分页限制**：上游接口会忽略 `offset` 参数，仅支持通过 `limit` 控制返回条数。
