---
title: '更新用户信息'
description: '登录后调用此接口，传入相关信息，可以更新用户信息'
---

# 更新用户信息

登录后调用此接口，传入相关信息，可以更新用户信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/user/update`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `user_update`                                    |
| SDK 函数   | `userUpdate`（`hana-music-api/api/user_update`） |
| 返回体类型 | `UnknownJson`（未建模接口）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userUpdate } from 'hana-music-api';

const result = await userUpdate(
  {
    gender: 0,
    signature: '测试签名',
    city: 440300,
    nickname: 'binary',
    birthday: 1525918298004,
    province: 440000,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/update' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'gender=0' \
  --data-urlencode 'signature=测试签名' \
  --data-urlencode 'city=440300' \
  --data-urlencode 'nickname=binary' \
  --data-urlencode 'birthday=1525918298004' \
  --data-urlencode 'province=440000'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型          | 必填 | 默认值 | 说明                            |
| ----------- | ------------- | ---- | ------ | ------------------------------- |
| `birthday`  | `number`      | 否   | -      | 出生日期，时间戳 unix timestamp |
| `city`      | `number`      | 否   | -      | 城市id                          |
| `gender`    | `0 \| 1 \| 2` | 否   | -      | 性别 0:保密 1:男性 2:女性       |
| `nickname`  | `string`      | 否   | -      | 用户昵称                        |
| `province`  | `number`      | 否   | -      | 省份id                          |
| `signature` | `string`      | 否   | -      | ：用户签名                      |

| `gender` | 性别 |
| -------- | ---- |
| `0`      | 保密 |
| `1`      | 男性 |
| `2`      | 女性 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
