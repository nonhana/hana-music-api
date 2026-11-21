---
title: '用户贡献条目、积分、云贝数量'
description: '登录后调用此接口，使用此接口，可获取当前登录用户贡献条目、积分、云贝数量'
---

# 用户贡献条目、积分、云贝数量

登录后调用此接口，使用此接口，可获取当前登录用户贡献条目、积分、云贝数量

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/ugc/user/devote`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 是                                                      |
| 对应模块   | `ugc_user_devote`                                       |
| SDK 函数   | `ugcUserDevote`（`hana-music-api/api/ugc_user_devote`） |
| 返回体类型 | `UgcUserDevoteBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcUserDevote } from 'hana-music-api';

const result = await ugcUserDevote({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/ugc/user/devote' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcUserDevoteBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_user_devote`、`hana-music-api/schemas/ugc_user_devote` 导入运行时校验器）。

```ts
type UgcUserDevoteBody = {
  code: 200;
  data: {
    userId: number;
    cloudShell?: number | null;
    integration?: number | null;
    ugcCount?: number | null;
  };
  message?: string | null;
};
```

| 字段               | 类型     | 必填 | 说明                         |
| ------------------ | -------- | ---- | ---------------------------- |
| `code`             | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`             | `object` | 是   | 接口返回的数据主体           |
| `data.userId`      | `number` | 是   | 用户 ID                      |
| `data.cloudShell`  | `number` | 否   | -                            |
| `data.integration` | `number` | 否   | -                            |
| `data.ugcCount`    | `number` | 否   | -                            |
| `message`          | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
