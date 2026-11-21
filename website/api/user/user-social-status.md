---
title: '用户状态'
description: '登录后调用此接口，传入用户id，获取用户状态'
---

# 用户状态

登录后调用此接口，传入用户id，获取用户状态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/user/social/status`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 是                                                            |
| 对应模块   | `user_social_status`                                          |
| SDK 函数   | `userSocialStatus`（`hana-music-api/api/user_social_status`） |
| 返回体类型 | `UserSocialStatusBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userSocialStatus } from 'hana-music-api';

const result = await userSocialStatus(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/social/status' \
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

返回体类型：`UserSocialStatusBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_social_status`、`hana-music-api/schemas/user_social_status` 导入运行时校验器）。

```ts
type UserSocialStatusBody = {
  code: 200;
  data?: Record<string, UnknownJson> | null;
  message?: string | null;
};
```

| 字段      | 类型                          | 必填 | 说明                         |
| --------- | ----------------------------- | ---- | ---------------------------- |
| `code`    | `200`                         | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `Record<string, UnknownJson>` | 否   | 接口返回的数据主体           |
| `message` | `string`                      | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
