---
title: '获取用户绑定信息'
description: '登录后调用此接口，可以获取用户绑定信息'
---

# 获取用户绑定信息

登录后调用此接口，可以获取用户绑定信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/user/binding`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `user_binding`                                     |
| SDK 函数   | `userBinding`（`hana-music-api/api/user_binding`） |
| 返回体类型 | `UserBindingBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userBinding } from 'hana-music-api';

const result = await userBinding(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/binding' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明    |
| ----- | ------------------ | ---- | ------ | ------- |
| `uid` | `number \| string` | 是   | -      | 用户 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserBindingBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_binding`、`hana-music-api/schemas/user_binding` 导入运行时校验器）。

```ts
type Binding = {
  id: number;
  bindingTime?: number | null;
  expired?: boolean | null;
  expiresIn?: number | null;
  refreshTime?: number | null;
  tokenJsonStr?: string | null;
  type?: number | null;
  url?: string | null;
  userId?: number | null;
};

type UserBindingBody = {
  code: 200;
  bindings: Array<Binding>;
};
```

| 字段                      | 类型             | 必填 | 说明                         |
| ------------------------- | ---------------- | ---- | ---------------------------- |
| `code`                    | `200`            | 是   | 业务状态码（`200` 表示成功） |
| `bindings`                | `Array<Binding>` | 是   | 账号第三方绑定列表           |
| `bindings[].id`           | `number`         | 是   | 记录 ID                      |
| `bindings[].bindingTime`  | `number`         | 否   | 绑定时间戳（毫秒）           |
| `bindings[].expired`      | `boolean`        | 否   | 是否已过期                   |
| `bindings[].expiresIn`    | `number`         | 否   | 有效期时长（秒）             |
| `bindings[].refreshTime`  | `number`         | 否   | 令牌刷新时间戳               |
| `bindings[].tokenJsonStr` | `string`         | 否   | 序列化令牌信息 JSON 字符串   |
| `bindings[].type`         | `number`         | 否   | -                            |
| `bindings[].url`          | `string`         | 否   | 资源访问地址                 |
| `bindings[].userId`       | `number`         | 否   | 用户 ID                      |

<!-- api-doc:response:end -->
