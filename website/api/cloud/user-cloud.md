---
title: '云盘'
description: '登录后调用此接口，可获取云盘数据，获取的数据没有对应 url，需要再调用一'
---

# 云盘

登录后调用此接口，可获取云盘数据，获取的数据没有对应 url，需要再调用一

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/user/cloud`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `user_cloud`                                   |
| SDK 函数   | `userCloud`（`hana-music-api/api/user_cloud`） |
| 返回体类型 | `UserCloudBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userCloud } from 'hana-music-api';

const result = await userCloud(
  {
    limit: 30,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/cloud' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                      |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `30`   | 返回数量，默认为 30                                                       |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*200，其中 200 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserCloudBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_cloud`、`hana-music-api/schemas/user_cloud` 导入运行时校验器）。

```ts
type CloudEntry = {
  songId: number;
  addTime?: number | null;
  album?: string | null;
  artist?: string | null;
  bitrate?: number | null;
  cover?: number | null;
  coverId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  lyricId?: string | null;
  matchType?: string | null;
  pcId?: number | null;
  privateCloud?: PrivateCloud | null;
  simpleSong?: LooseSong | null;
  songName?: string | null;
  version?: number | null;
};

type UserCloudBody = {
  code: 200;
  data: Array<CloudEntry>;
  count?: number | null;
  hasMore?: boolean | null;
  maxSize?: number | null;
  size?: number | null;
  updateTime?: number | null;
  upgradeSign?: number | null;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)、[PrivateCloud](/api/shared-types#privatecloud)

| 字段          | 类型                | 必填 | 说明                         |
| ------------- | ------------------- | ---- | ---------------------------- |
| `code`        | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `Array<CloudEntry>` | 是   | 接口返回的数据主体           |
| `count`       | `number`            | 否   | 条目总数                     |
| `hasMore`     | `boolean`           | 否   | 是否还有更多数据             |
| `maxSize`     | `number`            | 否   | -                            |
| `size`        | `number`            | 否   | -                            |
| `updateTime`  | `number`            | 否   | 时间戳                       |
| `upgradeSign` | `number`            | 否   | -                            |

<!-- api-doc:response:end -->
