---
title: '全部 mv'
description: '调用此接口，可获取全部 mv'
---

# 全部 mv

调用此接口，可获取全部 mv

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                     |
| ---------- | -------------------------------------- |
| 接口地址   | `/mv/all`                              |
| 请求方式   | `GET` / `POST`                         |
| 需要登录   | 否                                     |
| 对应模块   | `mv_all`                               |
| SDK 函数   | `mvAll`（`hana-music-api/api/mv_all`） |
| 返回体类型 | `MvAllBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvAll } from 'hana-music-api';

const result = await mvAll({
  area: '港台',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/all' \
  --data-urlencode 'area=港台'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值     | 说明                                                                        |
| -------- | -------- | ---- | ---------- | --------------------------------------------------------------------------- |
| `area`   | `string` | 否   | `全部`     | 地区，可选值为全部，内地，港台，欧美，日本，韩国，不填则为全部              |
| `limit`  | `number` | 否   | `30`       | 取出数量，默认为 30                                                         |
| `offset` | `number` | 否   | `0`        | 偏移数量，用于分页，如：(页数 - 1)\*50，其中 50 为 limit 的值，默认<br>为 0 |
| `order`  | `string` | 否   | `上升最快` | 排序，可选值为上升最快，最热，最新，不填则为上升最快                        |
| `type`   | `string` | 否   | `全部`     | 类型，可选值为全部，官方版，原生，现场版，网易出品，不填则为全部            |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvAllBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_all`、`hana-music-api/schemas/mv_all` 导入运行时校验器）。

```ts
type MvAllBody = {
  code: 200;
  count?: number | null;
  data: Array<MvSummary>;
  hasMore?: boolean | null;
};
```

- **公共类型**：[MvSummary](/api/shared-types#mvsummary)

| 字段      | 类型                                              | 必填 | 说明                         |
| --------- | ------------------------------------------------- | ---- | ---------------------------- |
| `code`    | `200`                                             | 是   | 业务状态码（`200` 表示成功） |
| `count`   | `number`                                          | 否   | 条目总数                     |
| `data`    | Array\<[MvSummary](/api/shared-types#mvsummary)\> | 是   | 接口返回的数据主体           |
| `hasMore` | `boolean`                                         | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
