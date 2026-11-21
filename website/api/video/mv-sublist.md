---
title: '收藏的 MV 列表'
description: '调用此接口，可获取收藏的 MV 列表'
---

# 收藏的 MV 列表

调用此接口，可获取收藏的 MV 列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/mv/sublist`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `mv_sublist`                                   |
| SDK 函数   | `mvSublist`（`hana-music-api/api/mv_sublist`） |
| 返回体类型 | `MvSublistBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvSublist } from 'hana-music-api';

const result = await mvSublist({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/sublist' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                         |
| -------- | -------- | ---- | ------ | ---------------------------- |
| `limit`  | `number` | 否   | `25`   | 返回数量，默认 `25`          |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvSublistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_sublist`、`hana-music-api/schemas/mv_sublist` 导入运行时校验器）。

```ts
type VideoCreator = {
  userId?: number | null;
  userName?: string | null;
};

type SubscribedVideo = {
  aliaName?: string | null;
  coverUrl?: string | null;
  creator?: Array<VideoCreator> | null;
  durationms?: number | null;
  markTypes?: Array<number> | null;
  playTime?: number | null;
  title?: string | null;
  transName?: string | null;
  type?: number | null;
  vid: string;
};

type MvSublistBody = {
  code: 200;
  count?: number | null;
  data: Array<SubscribedVideo>;
  hasMore?: boolean | null;
};
```

| 字段                        | 类型                     | 必填 | 说明                         |
| --------------------------- | ------------------------ | ---- | ---------------------------- |
| `code`                      | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `count`                     | `number`                 | 否   | 条目总数                     |
| `data`                      | `Array<SubscribedVideo>` | 是   | 接口返回的数据主体           |
| `data[].aliaName`           | `string`                 | 否   | -                            |
| `data[].coverUrl`           | `string`                 | 否   | 资源访问链接                 |
| `data[].creator`            | `Array<VideoCreator>`    | 否   | -                            |
| `data[].creator[].userId`   | `number`                 | 否   | 用户 ID                      |
| `data[].creator[].userName` | `string`                 | 否   | -                            |
| `data[].durationms`         | `number`                 | 否   | -                            |
| `data[].markTypes`          | `Array<number>`          | 否   | -                            |
| `data[].playTime`           | `number`                 | 否   | 时间戳                       |
| `data[].title`              | `string`                 | 否   | 标题                         |
| `data[].transName`          | `string`                 | 否   | -                            |
| `data[].type`               | `number`                 | 否   | -                            |
| `data[].vid`                | `string`                 | 是   | 视频 ID                      |
| `hasMore`                   | `boolean`                | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
