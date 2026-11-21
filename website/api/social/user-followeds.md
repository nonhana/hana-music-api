---
title: '获取用户粉丝列表'
description: '登录后调用此接口，传入用户 id，可以获取用户粉丝列表'
---

# 获取用户粉丝列表

登录后调用此接口，传入用户 id，可以获取用户粉丝列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/user/followeds`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `user_followeds`                                       |
| SDK 函数   | `userFolloweds`（`hana-music-api/api/user_followeds`） |
| 返回体类型 | `UserFollowedsBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userFolloweds } from 'hana-music-api';

const result = await userFolloweds(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/followeds' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                     |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------ |
| `uid`    | `number \| string` | 是   | -      | 用户 id                                                                  |
| `limit`  | `number`           | 否   | `30`   | 返回数量，默认为 30                                                      |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页 ，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserFollowedsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_followeds`、`hana-music-api/schemas/user_followeds` 导入运行时校验器）。

```ts
type Follower = Omit<UserProfile, 'py' | 'time' | 'vipRights'> & {
  py?: string | null;
  time?: number | null;
  vipRights?: VipRights | null;
};

type UserFollowedsBody = {
  code: 200;
  followeds: Array<Follower>;
  more?: boolean | null;
  newCount?: number | null;
  size?: number | null;
};
```

- **公共类型**：[UserProfile](/api/shared-types#userprofile)、[VipRights](/api/shared-types#viprights)

| 字段                    | 类型                                     | 必填 | 说明                                                          |
| ----------------------- | ---------------------------------------- | ---- | ------------------------------------------------------------- |
| `code`                  | `200`                                    | 是   | 业务状态码（`200` 表示成功）                                  |
| `followeds`             | `Array<Follower>`                        | 是   | 条目列表，继承自 [UserProfile](/api/shared-types#userprofile) |
| `followeds[].py`        | `string`                                 | 否   | -                                                             |
| `followeds[].time`      | `number`                                 | 否   | 时间戳                                                        |
| `followeds[].vipRights` | [VipRights](/api/shared-types#viprights) | 否   | VipRights 实体                                                |
| `more`                  | `boolean`                                | 否   | 是否还有更多数据                                              |
| `newCount`              | `number`                                 | 否   | -                                                             |
| `size`                  | `number`                                 | 否   | -                                                             |

<!-- api-doc:response:end -->
