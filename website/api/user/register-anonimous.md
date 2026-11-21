---
title: '游客登录'
description: '直接调用此接口，可获取游客cookie，如果遇到其他接口未登录状态报400状态码需要验证的错误，可使用此接口获取游客cookie避免报错'
---

# 游客登录

直接调用此接口，可获取游客cookie，如果遇到其他接口未登录状态报400状态码需要验证的错误，可使用此接口获取游客cookie避免报错

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/register/anonimous`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 否                                                             |
| 对应模块   | `register_anonimous`                                           |
| SDK 函数   | `registerAnonimous`（`hana-music-api/api/register_anonimous`） |
| 返回体类型 | `RegisterAnonimousBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { registerAnonimous } from 'hana-music-api';

const result = await registerAnonimous();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/register/anonimous'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RegisterAnonimousBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/register_anonimous`、`hana-music-api/schemas/register_anonimous` 导入运行时校验器）。

```ts
type RegisterAnonimousBody = {
  code: 200;
  userId: number;
  cookie: string;
  createTime?: number | null;
};
```

| 字段         | 类型     | 必填 | 说明                         |
| ------------ | -------- | ---- | ---------------------------- |
| `code`       | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `userId`     | `number` | 是   | 用户 ID                      |
| `cookie`     | `string` | 是   | 拼接后的 Cookie 字符串       |
| `createTime` | `number` | 否   | 时间戳                       |

<!-- api-doc:response:end -->
