---
title: '数字专辑销量'
description: '调用此接口，传入专辑 id，可获取数字专辑销量'
---

# 数字专辑销量

调用此接口，传入专辑 id，可获取数字专辑销量

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/digitalAlbum/sales`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 否                                                             |
| 对应模块   | `digitalAlbum_sales`                                           |
| SDK 函数   | `digitalAlbumSales`（`hana-music-api/api/digitalAlbum_sales`） |
| 返回体类型 | `DigitalAlbumSalesBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { digitalAlbumSales } from 'hana-music-api';

const result = await digitalAlbumSales({
  ids: [347230],
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/digitalAlbum/sales' \
  -H 'Content-Type: application/json' \
  --data '{"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明                         |
| ----- | ------------------------- | ---- | ------ | ---------------------------- |
| `ids` | `Array<number \| string>` | 是   | -      | 专辑 id，支持多个，用`,`隔开 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DigitalAlbumSalesBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/digitalAlbum_sales`、`hana-music-api/schemas/digitalAlbum_sales` 导入运行时校验器）。

```ts
type DigitalAlbumSalesBody = {
  code: 200;
  data: Record<string, number>;
};
```

| 字段   | 类型                     | 必填 | 说明                         |
| ------ | ------------------------ | ---- | ---------------------------- |
| `code` | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `data` | `Record<string, number>` | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->

## 注意事项

- **未知专辑行为**：传入未知专辑 ID 时仍返回 `code: 200`，对应销量值为 `0`。
