---
title: '评论抱一抱列表'
description: '调用此接口，可获取评论抱一抱列表'
---

# 评论抱一抱列表

调用此接口，可获取评论抱一抱列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                        |
| ---------- | --------------------------------------------------------- |
| 接口地址   | `/comment/hug/list`                                       |
| 请求方式   | `GET` / `POST`                                            |
| 需要登录   | 否                                                        |
| 对应模块   | `comment_hug_list`                                        |
| SDK 函数   | `commentHugList`（`hana-music-api/api/comment_hug_list`） |
| 返回体类型 | `CommentHugListBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentHugList } from 'hana-music-api';

const result = await commentHugList({
  uid: '285516405',
  cid: '1167145843',
  sid: '863481066',
  pageSize: 2,
  page: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/hug/list' \
  --data-urlencode 'uid=285516405' \
  --data-urlencode 'cid=1167145843' \
  --data-urlencode 'sid=863481066' \
  --data-urlencode 'pageSize=2' \
  --data-urlencode 'page=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                                          |
| ---------- | ------------------ | ---- | ------ | --------------------------------------------- |
| `cid`      | `number \| string` | 是   | -      | 评论 id                                       |
| `cursor`   | `string`           | 否   | `-1`   | 上一页返回的 cursor，默认-1，第一页不需要传   |
| `idCursor` | `number`           | 否   | `-1`   | 上一页返回的 idCursor，默认-1，第一页不需要传 |
| `page`     | `number`           | 否   | `1`    | 页数                                          |
| `pageSize` | `number`           | 否   | `100`  | 每页页数，默认 100                            |
| `sid`      | `number \| string` | 是   | -      | 资源 id                                       |
| `type`     | `number`           | 否   | -      | 资源类型，见下方枚举表，默认 `0`（歌曲）      |
| `uid`      | `number \| string` | 是   | -      | 用户 id                                       |

| `type` | 资源类型                          |
| ------ | --------------------------------- |
| `0`    | 歌曲                              |
| `1`    | MV                                |
| `2`    | 歌单                              |
| `3`    | 专辑                              |
| `4`    | 电台节目                          |
| `5`    | 视频                              |
| `6`    | 动态（部分接口需改传 `threadId`） |
| `7`    | 电台                              |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CommentHugListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_hug_list`、`hana-music-api/schemas/comment_hug_list` 导入运行时校验器）。

```ts
type HugUser = Omit<CommentUser, 'encryptUserId' | 'isHug'> & {
  encryptUserId?: string | null;
  isHug?: boolean | null;
};

type HugReply = Omit<
  CommentReply,
  'commentId' | 'owner' | 'user' | 'voiceDurationMillSecond'
> & {
  commentId?: number | null;
  owner?: boolean | null;
  user?: HugUser | null;
  voiceDurationMillSecond?: number | null;
};

type HugCurrentComment = Omit<
  CommentRecord,
  | 'beReplied'
  | 'commentId'
  | 'commentVideoVO'
  | 'extInfo'
  | 'highlight'
  | 'privacy'
  | 'repliedMark'
  | 'replyCount'
  | 'showFloorComment'
  | 'threadId'
  | 'user'
  | 'userTop'
  | 'voiceDurationMillSecond'
> & {
  beReplied?: Array<HugReply> | null;
  commentId?: number | null;
  commentVideoVO?: {
    allowCreation?: boolean | null;
    forbidCreationText?: string | null;
    showCreationEntrance?: boolean | null;
    videoCount?: number | null;
  } | null;
  extInfo?: {
    forwardEvent?: number | null;
    statistics?: {
      status_60?: number | null;
    } | null;
  } | null;
  highlight?: boolean | null;
  privacy?: number | null;
  repliedMark?: boolean | null;
  replyCount?: number | null;
  showFloorComment?: {
    replyCount?: number | null;
    showReplyCount?: boolean | null;
  } | null;
  threadId?: string | null;
  user?: HugUser | null;
  userTop?: boolean | null;
  voiceDurationMillSecond?: number | null;
};

type HugComment = {
  hugContent?: string | null;
  user?: HugUser | null;
};

type CommentHugListBody = {
  code: 200;
  data: {
    currentComment?: HugCurrentComment | null;
    hugComments: Array<HugComment>;
    hasMore?: boolean | null;
    cursor?: string | null;
    idCursor?: number | null;
    hugTotalCounts?: number | null;
  };
  message?: string | null;
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)、[CommentReply](/api/shared-types#commentreply)、[CommentUser](/api/shared-types#commentuser)

| 字段                            | 类型                | 必填 | 说明                                                    |
| ------------------------------- | ------------------- | ---- | ------------------------------------------------------- |
| `code`                          | `200`               | 是   | 业务状态码（`200` 表示成功）                            |
| `data`                          | `object`            | 是   | 接口返回的数据主体                                      |
| `data.currentComment`           | `HugCurrentComment` | 否   | 继承自 [CommentRecord](/api/shared-types#commentrecord) |
| `data.hugComments`              | `Array<HugComment>` | 是   | -                                                       |
| `data.hugComments[].hugContent` | `string`            | 否   | -                                                       |
| `data.hugComments[].user`       | `HugUser`           | 否   | 继承自 [CommentUser](/api/shared-types#commentuser)     |
| `data.hasMore`                  | `boolean`           | 否   | 是否还有更多数据                                        |
| `data.cursor`                   | `string`            | 否   | 下一页分页游标                                          |
| `data.idCursor`                 | `number`            | 否   | -                                                       |
| `data.hugTotalCounts`           | `number`            | 否   | -                                                       |
| `message`                       | `string`            | 否   | 返回说明信息                                            |

<!-- api-doc:response:end -->
