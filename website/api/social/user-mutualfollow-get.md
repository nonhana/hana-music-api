---
title: '用户是否互相关注'
description: '登录后调用此接口，传入用户id，可判断用户是否互相关注'
---

# 用户是否互相关注

登录后调用此接口，传入用户id，可判断用户是否互相关注

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/user/mutualfollow/get`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 是                                                                  |
| 对应模块   | `user_mutualfollow_get`                                             |
| SDK 函数   | `userMutualfollowGet`（`hana-music-api/api/user_mutualfollow_get`） |
| 返回体类型 | `UserMutualfollowGetBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userMutualfollowGet } from 'hana-music-api';

const result = await userMutualfollowGet(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/mutualfollow/get' \
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

返回体类型：`UserMutualfollowGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_mutualfollow_get`、`hana-music-api/schemas/user_mutualfollow_get` 导入运行时校验器）。

```ts
type UserMutualfollowGetBody = {
  code: 200;
  data: boolean;
};
```

| 字段   | 类型      | 必填 | 说明                         |
| ------ | --------- | ---- | ---------------------------- |
| `code` | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data` | `boolean` | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
