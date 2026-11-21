---
title: '获取热门话题'
description: '调用此接口，可获取热门话题'
---

# 获取热门话题

调用此接口，可获取热门话题

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/hot/topic`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `hot_topic`                                  |
| SDK 函数   | `hotTopic`（`hana-music-api/api/hot_topic`） |
| 返回体类型 | `HotTopicBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { hotTopic } from 'hana-music-api';

const result = await hotTopic({
  limit: 30,
  offset: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/hot/topic' \
  --data-urlencode 'limit=30' \
  --data-urlencode 'offset=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                              |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------- |
| `limit`  | `number` | 否   | `20`   | 取出评论数量，默认为 20                                           |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*20，其中 20 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`HotTopicBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/hot_topic`、`hana-music-api/schemas/hot_topic` 导入运行时校验器）。

```ts
type HotTopicRecord = {
  actId: number;
  alg?: string | null;
  isDefaultImg?: boolean | null;
  participateCount?: number | null;
  reason?: string | null;
  sharePicUrl?: string | null;
  text?: Array<string> | null;
  title?: string | null;
};

type HotTopicBody = {
  code: 200;
  hot: Array<HotTopicRecord>;
};
```

| 字段                     | 类型                    | 必填 | 说明                         |
| ------------------------ | ----------------------- | ---- | ---------------------------- |
| `code`                   | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `hot`                    | `Array<HotTopicRecord>` | 是   | -                            |
| `hot[].actId`            | `number`                | 是   | 话题 ID                      |
| `hot[].alg`              | `string`                | 否   | 推荐算法标识                 |
| `hot[].isDefaultImg`     | `boolean`               | 否   | -                            |
| `hot[].participateCount` | `number`                | 否   | -                            |
| `hot[].reason`           | `string`                | 否   | -                            |
| `hot[].sharePicUrl`      | `string`                | 否   | 资源访问链接                 |
| `hot[].text`             | `Array<string>`         | 否   | -                            |
| `hot[].title`            | `string`                | 否   | 标题                         |

<!-- api-doc:response:end -->
