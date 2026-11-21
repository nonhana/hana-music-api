---
title: '用户状态 - 支持设置的状态'
description: '登录后调用此接口，获取支持设置的状态'
---

# 用户状态 - 支持设置的状态

登录后调用此接口，获取支持设置的状态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| 接口地址   | `/user/social/status/support`                                                |
| 请求方式   | `GET` / `POST`                                                               |
| 需要登录   | 是                                                                           |
| 对应模块   | `user_social_status_support`                                                 |
| SDK 函数   | `userSocialStatusSupport`（`hana-music-api/api/user_social_status_support`） |
| 返回体类型 | `UserSocialStatusSupportBody`（已建模返回体）                                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userSocialStatusSupport } from 'hana-music-api';

const result = await userSocialStatusSupport(
  {},
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/social/status/support' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserSocialStatusSupportBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_social_status_support`、`hana-music-api/schemas/user_social_status_support` 导入运行时校验器）。

```ts
type SupportStatus = {
  type: string;
  iconUrl?: string | null;
  content?: string | null;
  actionUrl?: string | null;
  vistorUrl?: string | null;
  canEdit?: boolean | null;
  desc?: string | null;
};

type UserSocialStatusSupportBody = {
  code: 200;
  data: Array<SupportStatus>;
  message?: string | null;
};
```

| 字段               | 类型                   | 必填 | 说明                         |
| ------------------ | ---------------------- | ---- | ---------------------------- |
| `code`             | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `data`             | `Array<SupportStatus>` | 是   | 接口返回的数据主体           |
| `data[].type`      | `string`               | 是   | -                            |
| `data[].iconUrl`   | `string`               | 否   | 资源访问链接                 |
| `data[].content`   | `string`               | 否   | 正文内容                     |
| `data[].actionUrl` | `string`               | 否   | 资源访问链接                 |
| `data[].vistorUrl` | `string`               | 否   | 资源访问链接                 |
| `data[].canEdit`   | `boolean`              | 否   | -                            |
| `data[].desc`      | `string`               | 否   | 简介信息                     |
| `message`          | `string`               | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
