---
title: '关注/取消关注用户'
description: '登录后调用此接口，传入用户 id，和操作 t，可关注/取消关注用户'
---

# 关注/取消关注用户

登录后调用此接口，传入用户 id，和操作 t，可关注/取消关注用户

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                      |
| ---------- | --------------------------------------- |
| 接口地址   | `/follow`                               |
| 请求方式   | `GET` / `POST`                          |
| 需要登录   | 是                                      |
| 对应模块   | `follow`                                |
| SDK 函数   | `follow`（`hana-music-api/api/follow`） |
| 返回体类型 | `FollowBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { follow } from 'hana-music-api';

const result = await follow(
  {
    id: '32953014',
    t: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/follow' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=32953014' \
  --data-urlencode 't=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                      |
| ---- | ------------------ | ---- | ------ | ------------------------- |
| `id` | `number \| string` | 是   | -      | 用户 id                   |
| `t`  | `0 \| 1`           | 是   | -      | `1`为关注，其他为取消关注 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`FollowBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/follow`、`hana-music-api/schemas/follow` 导入运行时校验器）。

```ts
type FollowBody = {
  code: 200;
  msg?: string | null;
};
```

| 字段   | 类型     | 必填 | 说明                         |
| ------ | -------- | ---- | ---------------------------- |
| `code` | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `msg`  | `string` | 否   | 提示信息                     |

<!-- api-doc:response:end -->
