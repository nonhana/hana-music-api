---
title: '退出登录'
description: '调用此接口，可退出登录'
---

# 退出登录

调用此接口，可退出登录

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                      |
| ---------- | --------------------------------------- |
| 接口地址   | `/logout`                               |
| 请求方式   | `GET` / `POST`                          |
| 需要登录   | 否                                      |
| 对应模块   | `logout`                                |
| SDK 函数   | `logout`（`hana-music-api/api/logout`） |
| 返回体类型 | `LogoutBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { logout } from 'hana-music-api';

const result = await logout();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/logout'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LogoutBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/logout`、`hana-music-api/schemas/logout` 导入运行时校验器）。

```ts
type LogoutBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
