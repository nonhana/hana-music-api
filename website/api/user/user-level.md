---
title: '获取用户等级信息'
description: '获取当前登录账号的等级、听歌次数、登录天数及升级进度。'
---

# 获取用户等级信息

获取当前登录账号的等级、听歌次数、登录天数及升级进度。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/user/level`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `user_level`                                   |
| SDK 函数   | `userLevel`（`hana-music-api/api/user_level`） |
| 返回体类型 | `UserLevelBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userLevel } from 'hana-music-api';

const result = await userLevel({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/level' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserLevelBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_level`、`hana-music-api/schemas/user_level` 导入运行时校验器）。

```ts
type UserLevelBody = {
  code: 200;
  data: {
    userId: number;
    level: number;
    info?: string | null;
    nextLoginCount?: number | null;
    nextPlayCount?: number | null;
    nowLoginCount?: number | null;
    nowPlayCount?: number | null;
    progress?: number | null;
  };
  full?: boolean | null;
};
```

| 字段                  | 类型      | 必填 | 说明                         |
| --------------------- | --------- | ---- | ---------------------------- |
| `code`                | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`                | `object`  | 是   | 接口返回的数据主体           |
| `data.userId`         | `number`  | 是   | 用户 ID                      |
| `data.level`          | `number`  | 是   | 当前等级                     |
| `data.info`           | `string`  | 否   | -                            |
| `data.nextLoginCount` | `number`  | 否   | 升至下一等级所需登录天数     |
| `data.nextPlayCount`  | `number`  | 否   | 升至下一等级所需听歌次数     |
| `data.nowLoginCount`  | `number`  | 否   | 当前累计登录天数             |
| `data.nowPlayCount`   | `number`  | 否   | 当前累计听歌次数             |
| `data.progress`       | `number`  | 否   | 当前升级进度                 |
| `full`                | `boolean` | 否   | 是否已达到满级               |

<!-- api-doc:response:end -->

## 注意事项

- **身份要求**：需要传入有效登录 Cookie，详见 [认证机制](/guide/authentication)。
