---
title: '获取用户电台'
description: '登录后调用此接口，传入用户 id，可以获取用户电台'
---

# 获取用户电台

登录后调用此接口，传入用户 id，可以获取用户电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                       |
| ---------- | ---------------------------------------- |
| 接口地址   | `/user/dj`                               |
| 请求方式   | `GET` / `POST`                           |
| 需要登录   | 是                                       |
| 对应模块   | `user_dj`                                |
| SDK 函数   | `userDj`（`hana-music-api/api/user_dj`） |
| 返回体类型 | `UserDjBody`（已建模返回体）             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userDj } from 'hana-music-api';

const result = await userDj(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/dj' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                         |
| -------- | ------------------ | ---- | ------ | ---------------------------- |
| `uid`    | `number \| string` | 是   | -      | 用户 id                      |
| `limit`  | `number`           | 否   | `30`   | 返回数量，默认 `30`          |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserDjBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_dj`、`hana-music-api/schemas/user_dj` 导入运行时校验器）。

```ts
type UserDjBody = {
  code: 200;
  count?: number | null;
  more?: boolean | null;
  programs: Array<DjProgram>;
};
```

- **公共类型**：[DjProgram](/api/shared-types#djprogram)

| 字段       | 类型                                              | 必填 | 说明                         |
| ---------- | ------------------------------------------------- | ---- | ---------------------------- |
| `code`     | `200`                                             | 是   | 业务状态码（`200` 表示成功） |
| `count`    | `number`                                          | 否   | 条目总数                     |
| `more`     | `boolean`                                         | 否   | 是否还有更多数据             |
| `programs` | Array\<[DjProgram](/api/shared-types#djprogram)\> | 是   | 电台节目列表                 |

<!-- api-doc:response:end -->
