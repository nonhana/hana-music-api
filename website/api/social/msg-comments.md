---
title: '通知 - 评论'
description: '登录后调用此接口 ，可获取评论'
---

# 通知 - 评论

登录后调用此接口 ，可获取评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/msg/comments`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `msg_comments`                                     |
| SDK 函数   | `msgComments`（`hana-music-api/api/msg_comments`） |
| 返回体类型 | `MsgCommentsBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { msgComments } from 'hana-music-api';

const result = await msgComments(
  {
    uid: '32953014',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/msg/comments' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                         |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------ |
| `uid`    | `number \| string` | 是   | -      | 用户 的 id，只能和登录账号的 id 一致                         |
| `limit`  | `number`           | 否   | `30`   | 返回数量，默认为 30                                          |
| `before` | `number`           | 否   | `-1`   | 分页参数，取上一页最后一个歌单的 `updateTime` 获取下一页数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MsgCommentsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/msg_comments`、`hana-music-api/schemas/msg_comments` 导入运行时校验器）。

```ts
type ReceivedCommentUser = Omit<CommentUser, 'experts'> & {
  experts?: Record<string, string> | null;
};

type ReceivedComment = Omit<
  CommentRecord,
  | 'beRepliedContent'
  | 'beRepliedUser'
  | 'combindId'
  | 'commentExist'
  | 'commentStatus'
  | 'resourceJson'
  | 'resourceType'
  | 'subCommentExist'
  | 'threadId'
  | 'user'
> & {
  beRepliedContent?: string | null;
  beRepliedUser?: ReceivedCommentUser | null;
  combindId?: string | null;
  commentExist?: boolean | null;
  commentStatus?: number | null;
  resourceJson?: string | null;
  resourceType?: number | null;
  subCommentExist?: boolean | null;
  threadId?: string | null;
  user?: ReceivedCommentUser | null;
};

type MsgCommentsBody = {
  code: 200;
  comments: Array<ReceivedComment>;
  more?: boolean | null;
  total?: number | null;
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)、[CommentUser](/api/shared-types#commentuser)

| 字段       | 类型                     | 必填 | 说明                         |
| ---------- | ------------------------ | ---- | ---------------------------- |
| `code`     | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `comments` | `Array<ReceivedComment>` | 是   | 评论列表                     |
| `more`     | `boolean`                | 否   | 是否还有更多数据             |
| `total`    | `number`                 | 否   | 总条目数                     |

<!-- api-doc:response:end -->
