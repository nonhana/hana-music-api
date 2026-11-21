---
title: '获取用户详情'
description: '登录后调用此接口，传入用户 id，可以获取用户详情'
---

# 获取用户详情

登录后调用此接口，传入用户 id，可以获取用户详情

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/user/detail`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `user_detail`                                    |
| SDK 函数   | `userDetail`（`hana-music-api/api/user_detail`） |
| 返回体类型 | `UserDetailBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userDetail } from 'hana-music-api';

const result = await userDetail(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/detail' \
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

返回体类型：`UserDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_detail`、`hana-music-api/schemas/user_detail` 导入运行时校验器）。

```ts
type Binding = {
  bindingTime?: number | null;
  expired?: boolean | null;
  expiresIn?: number | null;
  id?: number | null;
  refreshTime?: number | null;
  tokenJsonStr?: string | null;
  type?: number | null;
  url?: string | null;
  userId?: number | null;
};

type ExpertRole = {
  roleId?: number | null;
  roleName?: string | null;
};

type UserProduct = {
  productionTypeId?: number | null;
  productionTypeName?: string | null;
};

type UserPoint = {
  balance?: number | null;
  blockBalance?: number | null;
  status?: number | null;
  updateTime?: number | null;
  userId?: number | null;
  version?: number | null;
};

type UserDetailBody = {
  code: 200;
  profile: UserProfile;
  adValid?: boolean | null;
  bindings?: Array<Binding> | null;
  createDays?: number | null;
  createTime?: number | null;
  currentExpert?: ExpertRole | null;
  expertArray?: Array<ExpertRole> | null;
  identify?: {
    imageDesc?: string | null;
    imageUrl?: string | null;
  } | null;
  level?: number | null;
  listenSongs?: number | null;
  mobileSign?: boolean | null;
  newUser?: boolean | null;
  pcSign?: boolean | null;
  peopleCanSeeMyPlayRecord?: boolean | null;
  products?: Array<UserProduct> | null;
  profileVillageInfo?: {
    targetUrl?: string | null;
    title?: string | null;
  } | null;
  recallUser?: boolean | null;
  userPoint?: UserPoint | null;
};
```

- **公共类型**：[UserProfile](/api/shared-types#userprofile)

| 字段                            | 类型                                         | 必填 | 说明                                        |
| ------------------------------- | -------------------------------------------- | ---- | ------------------------------------------- |
| `code`                          | `200`                                        | 是   | 业务状态码（`200` 表示成功）                |
| `profile`                       | [UserProfile](/api/shared-types#userprofile) | 是   | 用户资料信息（未登录或匿名账号时为 `null`） |
| `adValid`                       | `boolean`                                    | 否   | -                                           |
| `bindings`                      | `Array<Binding>`                             | 否   | 账号第三方绑定列表                          |
| `bindings[].bindingTime`        | `number`                                     | 否   | 绑定时间戳（毫秒）                          |
| `bindings[].expired`            | `boolean`                                    | 否   | 是否已过期                                  |
| `bindings[].expiresIn`          | `number`                                     | 否   | 有效期时长（秒）                            |
| `bindings[].id`                 | `number`                                     | 否   | 记录 ID                                     |
| `bindings[].refreshTime`        | `number`                                     | 否   | 令牌刷新时间戳                              |
| `bindings[].tokenJsonStr`       | `string`                                     | 否   | 序列化令牌信息 JSON 字符串                  |
| `bindings[].type`               | `number`                                     | 否   | -                                           |
| `bindings[].url`                | `string`                                     | 否   | 资源访问地址                                |
| `bindings[].userId`             | `number`                                     | 否   | 用户 ID                                     |
| `createDays`                    | `number`                                     | 否   | -                                           |
| `createTime`                    | `number`                                     | 否   | 时间戳                                      |
| `currentExpert`                 | `ExpertRole`                                 | 否   | -                                           |
| `currentExpert.roleId`          | `number`                                     | 否   | role ID                                     |
| `currentExpert.roleName`        | `string`                                     | 否   | -                                           |
| `expertArray`                   | `Array<ExpertRole>`                          | 否   | -                                           |
| `expertArray[].roleId`          | `number`                                     | 否   | role ID                                     |
| `expertArray[].roleName`        | `string`                                     | 否   | -                                           |
| `identify`                      | `object`                                     | 否   | -                                           |
| `identify.imageDesc`            | `string`                                     | 否   | -                                           |
| `identify.imageUrl`             | `string`                                     | 否   | 资源访问链接                                |
| `level`                         | `number`                                     | 否   | 当前等级                                    |
| `listenSongs`                   | `number`                                     | 否   | -                                           |
| `mobileSign`                    | `boolean`                                    | 否   | -                                           |
| `newUser`                       | `boolean`                                    | 否   | -                                           |
| `pcSign`                        | `boolean`                                    | 否   | -                                           |
| `peopleCanSeeMyPlayRecord`      | `boolean`                                    | 否   | -                                           |
| `products`                      | `Array<UserProduct>`                         | 否   | 数字专辑商品列表                            |
| `products[].productionTypeId`   | `number`                                     | 否   | productionType ID                           |
| `products[].productionTypeName` | `string`                                     | 否   | -                                           |
| `profileVillageInfo`            | `object`                                     | 否   | -                                           |
| `profileVillageInfo.targetUrl`  | `string`                                     | 否   | 资源访问链接                                |
| `profileVillageInfo.title`      | `string`                                     | 否   | 标题                                        |
| `recallUser`                    | `boolean`                                    | 否   | -                                           |
| `userPoint`                     | `UserPoint`                                  | 否   | 当前账号云贝余额与积分信息                  |
| `userPoint.balance`             | `number`                                     | 否   | 当前云贝余额                                |
| `userPoint.blockBalance`        | `number`                                     | 否   | -                                           |
| `userPoint.status`              | `number`                                     | 否   | -                                           |
| `userPoint.updateTime`          | `number`                                     | 否   | 时间戳                                      |
| `userPoint.userId`              | `number`                                     | 否   | 用户 ID                                     |
| `userPoint.version`             | `number`                                     | 否   | 当前服务版本号                              |

<!-- api-doc:response:end -->
