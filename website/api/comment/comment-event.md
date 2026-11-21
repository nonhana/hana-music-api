---
title: '获取动态评论'
description: '登录后调用此接口，可以获取动态下评论'
---

# 获取动态评论

登录后调用此接口，可以获取动态下评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/comment/event`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `comment_event`                                      |
| SDK 函数   | `commentEvent`（`hana-music-api/api/comment_event`） |
| 返回体类型 | `CommentEventBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentEvent } from 'hana-music-api';

const result = await commentEvent(
  {
    threadId: 'A_EV_2_6559519868_32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/event' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'threadId=A_EV_2_6559519868_32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明                                              |
| ---------- | -------- | ---- | ------ | ------------------------------------------------- |
| `before`   | `number` | 否   | `0`    | 分页游标，取上一页最后一条评论的 `time`，默认 `0` |
| `limit`    | `number` | 否   | `20`   | 返回数量，默认 `20`                               |
| `offset`   | `number` | 否   | `0`    | 偏移数量，用于分页，默认 `0`                      |
| `threadId` | `string` | 是   | -      | 动态线程 ID（可从动态接口的 `threadId` 字段获取） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CommentEventBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_event`、`hana-music-api/schemas/comment_event` 导入运行时校验器）。

```ts
type CommentEventBody = {
  code: 200;
  comments: Array<CommentRecord>;
  hotComments?: Array<CommentRecord> | null;
  cnum?: number | null;
  isMusician?: boolean | null;
  more?: boolean | null;
  moreHot?: boolean | null;
  total?: number | null;
  userId?: number | null;
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段          | 类型                                                      | 必填 | 说明                         |
| ------------- | --------------------------------------------------------- | ---- | ---------------------------- |
| `code`        | `200`                                                     | 是   | 业务状态码（`200` 表示成功） |
| `comments`    | Array\<[CommentRecord](/api/shared-types#commentrecord)\> | 是   | 评论列表                     |
| `hotComments` | Array\<[CommentRecord](/api/shared-types#commentrecord)\> | 可空 | 热门评论列表                 |
| `cnum`        | `number`                                                  | 否   | -                            |
| `isMusician`  | `boolean`                                                 | 否   | -                            |
| `more`        | `boolean`                                                 | 否   | 是否还有更多数据             |
| `moreHot`     | `boolean`                                                 | 否   | -                            |
| `total`       | `number`                                                  | 否   | 总条目数                     |
| `userId`      | `number`                                                  | 否   | 用户 ID                      |

<!-- api-doc:response:end -->
