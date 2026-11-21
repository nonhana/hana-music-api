---
title: '收藏的专栏'
description: '调用此接口，可获取收藏的专栏'
---

# 收藏的专栏

调用此接口，可获取收藏的专栏

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/topic/sublist`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `topic_sublist`                                      |
| SDK 函数   | `topicSublist`（`hana-music-api/api/topic_sublist`） |
| 返回体类型 | `TopicSublistBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topicSublist } from 'hana-music-api';

const result = await topicSublist({
  limit: 2,
  offset: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/topic/sublist' \
  --data-urlencode 'limit=2' \
  --data-urlencode 'offset=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                              |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------- |
| `limit`  | `number` | 否   | `50`   | 取出歌单数量，默认为 50                                           |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*50，其中 50 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopicSublistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/topic_sublist`、`hana-music-api/schemas/topic_sublist` 导入运行时校验器）。

```ts
type SubscribedTopic = {
  id: number;
  author?: string | null;
  picId?: number | null;
  readCount?: number | null;
  rectanglePicUrl?: string | null;
  resUrl?: string | null;
  subTime?: number | null;
  title?: string | null;
  userId?: number | null;
};

type TopicSublistBody = {
  code: 200;
  data: Array<SubscribedTopic>;
  count?: number | null;
  hasMore?: boolean | null;
};
```

| 字段                     | 类型                     | 必填 | 说明                         |
| ------------------------ | ------------------------ | ---- | ---------------------------- |
| `code`                   | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                   | `Array<SubscribedTopic>` | 是   | 接口返回的数据主体           |
| `data[].id`              | `number`                 | 是   | 记录 ID                      |
| `data[].author`          | `string`                 | 否   | -                            |
| `data[].picId`           | `number`                 | 否   | pic ID                       |
| `data[].readCount`       | `number`                 | 否   | -                            |
| `data[].rectanglePicUrl` | `string`                 | 否   | 资源访问链接                 |
| `data[].resUrl`          | `string`                 | 否   | 资源访问链接                 |
| `data[].subTime`         | `number`                 | 否   | 时间戳                       |
| `data[].title`           | `string`                 | 否   | 标题                         |
| `data[].userId`          | `number`                 | 否   | 用户 ID                      |
| `count`                  | `number`                 | 否   | 条目总数                     |
| `hasMore`                | `boolean`                | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
