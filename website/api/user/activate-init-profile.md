---
title: '初始化昵称'
description: '刚注册的账号(需登录)，调用此接口 ，可初始化昵称'
---

# 初始化昵称

刚注册的账号(需登录)，调用此接口 ，可初始化昵称

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/activate/init/profile`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 是                                                                  |
| 对应模块   | `activate_init_profile`                                             |
| SDK 函数   | `activateInitProfile`（`hana-music-api/api/activate_init_profile`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { activateInitProfile } from 'hana-music-api';

const result = await activateInitProfile(
  {
    nickname: 'testUser2019',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/activate/init/profile' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'nickname=testUser2019'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明 |
| ---------- | -------- | ---- | ------ | ---- |
| `nickname` | `string` | 是   | -      | 昵称 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
