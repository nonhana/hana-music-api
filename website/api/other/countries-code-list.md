---
title: '国家编码列表'
description: '调用此接口，可获取国家编码列表'
---

# 国家编码列表

调用此接口，可获取国家编码列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/countries/code/list`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 否                                                              |
| 对应模块   | `countries_code_list`                                           |
| SDK 函数   | `countriesCodeList`（`hana-music-api/api/countries_code_list`） |
| 返回体类型 | `CountriesCodeListBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { countriesCodeList } from 'hana-music-api';

const result = await countriesCodeList();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/countries/code/list'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CountriesCodeListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/countries_code_list`、`hana-music-api/schemas/countries_code_list` 导入运行时校验器）。

```ts
type Country = {
  code: string;
  en?: string | null;
  locale?: string | null;
  zh?: string | null;
};

type CountryGroup = {
  label?: string | null;
  countryList: Array<Country>;
};

type CountriesCodeListBody = {
  code: 200;
  data: Array<CountryGroup>;
  message?: string | null;
};
```

| 字段                          | 类型                  | 必填 | 说明                         |
| ----------------------------- | --------------------- | ---- | ---------------------------- |
| `code`                        | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`                        | `Array<CountryGroup>` | 是   | 接口返回的数据主体           |
| `data[].label`                | `string`              | 否   | -                            |
| `data[].countryList`          | `Array<Country>`      | 是   | -                            |
| `data[].countryList[].code`   | `string`              | 是   | 业务状态码（`200` 表示成功） |
| `data[].countryList[].en`     | `string`              | 否   | -                            |
| `data[].countryList[].locale` | `string`              | 否   | -                            |
| `data[].countryList[].zh`     | `string`              | 否   | -                            |
| `message`                     | `string`              | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
