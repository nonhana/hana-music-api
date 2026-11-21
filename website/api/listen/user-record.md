---
title: '获取用户播放记录'
description: '登录后调用此接口，传入用户 id，可获取用户播放记录'
---

# 获取用户播放记录

登录后调用此接口，传入用户 id，可获取用户播放记录

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/user/record`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 是                                               |
| 对应模块   | `user_record`                                    |
| SDK 函数   | `userRecord`（`hana-music-api/api/user_record`） |
| 返回体类型 | `UserRecordBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userRecord } from 'hana-music-api';

const result = await userRecord(
  {
    uid: '32953014',
    type: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/record' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014' \
  --data-urlencode 'type=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                            |
| ------ | ------------------ | ---- | ------ | ----------------------------------------------- |
| `uid`  | `number \| string` | 是   | -      | 用户 id                                         |
| `type` | `0 \| 1`           | 否   | `0`    | type=1 时只返回 weekData，type=0 时返回 allData |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserRecordBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_record`、`hana-music-api/schemas/user_record` 导入运行时校验器）。

```ts
type PlayRecord = {
  playCount?: number | null;
  score?: number | null;
  song: Song;
};

type UserRecordBody = {
  code: 200;
  allData?: Array<PlayRecord> | null;
  weekData?: Array<PlayRecord> | null;
};
```

- **公共类型**：[Song](/api/shared-types#song)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                   | 类型                           | 必填 | 说明                         |
| ---------------------- | ------------------------------ | ---- | ---------------------------- |
| `code`                 | `200`                          | 是   | 业务状态码（`200` 表示成功） |
| `allData`              | `Array<PlayRecord>`            | 可空 | -                            |
| `allData[].playCount`  | `number`                       | 否   | 播放次数                     |
| `allData[].score`      | `number`                       | 否   | -                            |
| `allData[].song`       | [Song](/api/shared-types#song) | 是   | Song 实体                    |
| `weekData`             | `Array<PlayRecord>`            | 可空 | -                            |
| `weekData[].playCount` | `number`                       | 否   | 播放次数                     |
| `weekData[].score`     | `number`                       | 否   | -                            |
| `weekData[].song`      | [Song](/api/shared-types#song) | 是   | Song 实体                    |

<!-- api-doc:response:end -->
