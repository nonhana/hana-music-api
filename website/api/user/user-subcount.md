---
title: '获取用户信息，歌单，收藏，mv, dj 数量'
description: '登录后调用此接口，可以获取用户信息'
---

# 获取用户信息，歌单，收藏，mv, dj 数量

登录后调用此接口，可以获取用户信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/user/subcount`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `user_subcount`                                      |
| SDK 函数   | `userSubcount`（`hana-music-api/api/user_subcount`） |
| 返回体类型 | `UserSubcountBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userSubcount } from 'hana-music-api';

const result = await userSubcount({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/subcount' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserSubcountBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_subcount`、`hana-music-api/schemas/user_subcount` 导入运行时校验器）。

```ts
type UserSubcountBody = {
  code: 200;
  artistCount?: number | null;
  createDjRadioCount?: number | null;
  createdPlaylistCount?: number | null;
  djRadioCount?: number | null;
  mvCount?: number | null;
  newProgramCount?: number | null;
  programCount?: number | null;
  subPlaylistCount?: number | null;
};
```

| 字段                   | 类型     | 必填 | 说明                         |
| ---------------------- | -------- | ---- | ---------------------------- |
| `code`                 | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `artistCount`          | `number` | 否   | -                            |
| `createDjRadioCount`   | `number` | 否   | -                            |
| `createdPlaylistCount` | `number` | 否   | -                            |
| `djRadioCount`         | `number` | 否   | -                            |
| `mvCount`              | `number` | 否   | -                            |
| `newProgramCount`      | `number` | 否   | -                            |
| `programCount`         | `number` | 否   | -                            |
| `subPlaylistCount`     | `number` | 否   | -                            |

<!-- api-doc:response:end -->
