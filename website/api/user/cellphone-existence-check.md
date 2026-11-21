---
title: '检测手机号码是否已注册'
description: '调用此接口 ，可检测手机号码是否已注册'
---

# 检测手机号码是否已注册

调用此接口 ，可检测手机号码是否已注册

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/cellphone/existence/check`                                                |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 否                                                                          |
| 对应模块   | `cellphone_existence_check`                                                 |
| SDK 函数   | `cellphoneExistenceCheck`（`hana-music-api/api/cellphone_existence_check`） |
| 返回体类型 | `CellphoneExistenceCheckBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { cellphoneExistenceCheck } from 'hana-music-api';

const result = await cellphoneExistenceCheck({
  phone: '13xxx',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/cellphone/existence/check' \
  --data-urlencode 'phone=13xxx'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型               | 必填 | 默认值 | 说明                                                       |
| ------------- | ------------------ | ---- | ------ | ---------------------------------------------------------- |
| `countrycode` | `number \| string` | 否   | 86     | 国家码，用于国外手机号，例如美国传入：`1` ，默认 86 即中国 |
| `phone`       | `string`           | 是   | -      | 手机号码                                                   |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CellphoneExistenceCheckBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/cellphone_existence_check`、`hana-music-api/schemas/cellphone_existence_check` 导入运行时校验器）。

```ts
type CellphoneExistenceCheckBody = {
  code: 200;
  exist: number;
  avatarUrl?: string | null;
  cellphone?: string | null;
  countryCode?: string | null;
  hasPassword?: boolean | null;
  hasSnsBinded?: boolean | null;
  nickname?: string | null;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `exist`        | `number`  | 是   | -                            |
| `avatarUrl`    | `string`  | 否   | 头像图片 URL                 |
| `cellphone`    | `string`  | 否   | -                            |
| `countryCode`  | `string`  | 否   | -                            |
| `hasPassword`  | `boolean` | 否   | -                            |
| `hasSnsBinded` | `boolean` | 否   | -                            |
| `nickname`     | `string`  | 否   | 用户昵称                     |

<!-- api-doc:response:end -->
