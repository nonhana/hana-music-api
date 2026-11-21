---
title: '广播电台 - 全部电台'
description: '调用此接口，获取广播电台 - 全部电台'
---

# 广播电台 - 全部电台

调用此接口，获取广播电台 - 全部电台

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                    |
| ---------- | --------------------------------------------------------------------- |
| 接口地址   | `/broadcast/channel/list`                                             |
| 请求方式   | `GET` / `POST`                                                        |
| 需要登录   | 否                                                                    |
| 对应模块   | `broadcast_channel_list`                                              |
| SDK 函数   | `broadcastChannelList`（`hana-music-api/api/broadcast_channel_list`） |
| 返回体类型 | `BroadcastChannelListBody`（已建模返回体）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { broadcastChannelList } from 'hana-music-api';

const result = await broadcastChannelList({
  categoryId: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/broadcast/channel/list' \
  --data-urlencode 'categoryId=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数         | 类型     | 必填 | 默认值 | 说明                                                     |
| ------------ | -------- | ---- | ------ | -------------------------------------------------------- |
| `categoryId` | `number` | 否   | `0`    | 类别id，默认为 0，可从“广播电台 - 分类/地区信息”接口获取 |
| `regionId`   | `number` | 否   | `0`    | 地区id，默认为 0，可从“广播电台 - 分类/地区信息”接口获取 |
| `limit`      | `number` | 否   | `20`   | 返回数量，默认 `20`                                      |
| `lastId`     | `number` | 否   | `0`    | 分页游标 ID（上一页最后一项的 ID），默认 `0`             |
| `score`      | `number` | 否   | `-1`   | 分页游标分数，默认 `-1`                                  |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`BroadcastChannelListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/broadcast_channel_list`、`hana-music-api/schemas/broadcast_channel_list` 导入运行时校验器）。

```ts
type Channel = {
  id: number;
  coverUrl?: string | null;
  name?: string | null;
  regionName?: string | null;
  roomId?: number | null;
  score?: number | null;
  source?: string | null;
  subed?: boolean | null;
};

type BroadcastChannelListBody = {
  code: 200;
  data: {
    list: Array<Channel>;
    hasMore?: boolean | null;
    total?: number | null;
  };
  message?: string | null;
};
```

| 字段                     | 类型             | 必填 | 说明                         |
| ------------------------ | ---------------- | ---- | ---------------------------- |
| `code`                   | `200`            | 是   | 业务状态码（`200` 表示成功） |
| `data`                   | `object`         | 是   | 接口返回的数据主体           |
| `data.list`              | `Array<Channel>` | 是   | 结果条目列表                 |
| `data.list[].id`         | `number`         | 是   | 记录 ID                      |
| `data.list[].coverUrl`   | `string`         | 否   | 资源访问链接                 |
| `data.list[].name`       | `string`         | 否   | 名称                         |
| `data.list[].regionName` | `string`         | 否   | -                            |
| `data.list[].roomId`     | `number`         | 否   | 一起听房间 ID                |
| `data.list[].score`      | `number`         | 否   | -                            |
| `data.list[].source`     | `string`         | 否   | -                            |
| `data.list[].subed`      | `boolean`        | 否   | 是否已收藏/订阅              |
| `data.hasMore`           | `boolean`        | 否   | 是否还有更多数据             |
| `data.total`             | `number`         | 否   | 总条目数                     |
| `message`                | `string`         | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
