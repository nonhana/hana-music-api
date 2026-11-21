---
title: '获取用户历史评论'
description: '登录后调用此接口，传入用户 id，可以获取用户历史评论'
---

# 获取用户历史评论

登录后调用此接口，传入用户 id，可以获取用户历史评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                |
| ---------- | ----------------------------------------------------------------- |
| 接口地址   | `/user/comment/history`                                           |
| 请求方式   | `GET` / `POST`                                                    |
| 需要登录   | 是                                                                |
| 对应模块   | `user_comment_history`                                            |
| SDK 函数   | `userCommentHistory`（`hana-music-api/api/user_comment_history`） |
| 返回体类型 | `UserCommentHistoryBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userCommentHistory } from 'hana-music-api';

const result = await userCommentHistory(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/comment/history' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明                                        |
| ------- | ------------------ | ---- | ------ | ------------------------------------------- |
| `uid`   | `number \| string` | 是   | -      | 用户 id                                     |
| `limit` | `number`           | 否   | `10`   | 返回数量，默认为 10                         |
| `time`  | `number`           | 否   | `0`    | 上一条数据的 time，第一页不需要传，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserCommentHistoryBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_comment_history`、`hana-music-api/schemas/user_comment_history` 导入运行时校验器）。

```ts
type HistoryComment = Omit<
  CommentRecord,
  | 'beRepliedContent'
  | 'beRepliedUser'
  | 'resourceInfo'
  | 'resourceType'
  | 'threadId'
> & {
  beRepliedContent?: string | null;
  beRepliedUser?: CommentUser | null;
  resourceInfo?: string | null;
  resourceType?: number | null;
  threadId?: string | null;
};

type HistoryData = {
  comments?: Array<HistoryComment> | null;
  hotComments?: Array<HistoryComment> | null;
  commentCount?: number | null;
  hasMore?: boolean | null;
  reminder?: boolean | null;
};

type UserCommentHistoryBody = {
  code: 200;
  data: HistoryData;
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)、[CommentUser](/api/shared-types#commentuser)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                  | 类型                                         | 必填 | 说明                         |
| ------------------------------------- | -------------------------------------------- | ---- | ---------------------------- |
| `code`                                | `200`                                        | 是   | 业务状态码（`200` 表示成功） |
| `data`                                | `HistoryData`                                | 是   | 接口返回的数据主体           |
| `data.comments`                       | `Array<HistoryComment>`                      | 可空 | 评论列表                     |
| `data.comments[].beRepliedContent`    | `string`                                     | 否   | -                            |
| `data.comments[].beRepliedUser`       | [CommentUser](/api/shared-types#commentuser) | 否   | CommentUser 实体             |
| `data.comments[].resourceInfo`        | `string`                                     | 否   | -                            |
| `data.comments[].resourceType`        | `number`                                     | 否   | -                            |
| `data.comments[].threadId`            | `string`                                     | 否   | 评论线程 ID                  |
| `data.hotComments`                    | `Array<HistoryComment>`                      | 可空 | 热门评论列表                 |
| `data.hotComments[].beRepliedContent` | `string`                                     | 否   | -                            |
| `data.hotComments[].beRepliedUser`    | [CommentUser](/api/shared-types#commentuser) | 否   | CommentUser 实体             |
| `data.hotComments[].resourceInfo`     | `string`                                     | 否   | -                            |
| `data.hotComments[].resourceType`     | `number`                                     | 否   | -                            |
| `data.hotComments[].threadId`         | `string`                                     | 否   | 评论线程 ID                  |
| `data.commentCount`                   | `number`                                     | 否   | 评论数                       |
| `data.hasMore`                        | `boolean`                                    | 否   | 是否还有更多数据             |
| `data.reminder`                       | `boolean`                                    | 否   | -                            |

<!-- api-doc:response:end -->
