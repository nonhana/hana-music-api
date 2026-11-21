---
title: '新版评论接口'
description: '调用此接口，传入资源类型和资源 id，以及排序方式，可获取对应资源的评论'
---

# 新版评论接口

调用此接口，传入资源类型和资源 id，以及排序方式，可获取对应资源的评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/comment/new`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `comment_new`                                    |
| SDK 函数   | `commentNew`（`hana-music-api/api/comment_new`） |
| 返回体类型 | `CommentNewBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentNew } from 'hana-music-api';

const result = await commentNew({
  type: 0,
  id: '1407551413',
  sortType: 3,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/new' \
  --data-urlencode 'type=0' \
  --data-urlencode 'id=1407551413' \
  --data-urlencode 'sortType=3'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型               | 必填 | 默认值 | 说明                                                                                                                                                       |
| ----------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cursor`    | `string`           | 否   | `0`    | 当`sortType`为 3 时且页数不是第一页时需传入，值为上一条数据的 time                                                                                         |
| `id`        | `number \| string` | 是   | -      | 资源 id，如歌曲 id，mv id                                                                                                                                  |
| `pageNo`    | `number`           | 否   | `1`    | 分页参数，第 N 页，默认为 1                                                                                                                                |
| `pageSize`  | `number`           | 否   | `20`   | 分页参数，每页多少条数据，默认 20                                                                                                                          |
| `showInner` | `boolean`          | 否   | `true` | 是否返回楼中楼回复，默认 `true`                                                                                                                            |
| `sortType`  | `number`           | 否   | `99`   | 排序方式，1:按推荐排序，2:按热度排序，3:按时间排序                                                                                                         |
| `type`      | `number`           | 是   | -      | 数字，资源类型，对应歌曲，mv，专辑，歌单，电台，视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |

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

| `sortType` | 排序方式                      |
| ---------- | ----------------------------- |
| `99`       | 按推荐排序（默认）            |
| `2`        | 按热度排序                    |
| `3`        | 按时间排序（需配合 `cursor`） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CommentNewBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_new`、`hana-music-api/schemas/comment_new` 导入运行时校验器）。

```ts
type NewVipRight = {
  iconUrl?: string | null;
  rights?: boolean | null;
  vipCode?: number | null;
};

type NewVipLogo = {
  logoDto?: {
    actionUrl?: string | null;
    height?: number | null;
    interestId?: number | null;
    logoType?: number | null;
    url?: string | null;
    width?: number | null;
  } | null;
  vipType?: number | null;
};

type NewVipRights = {
  associator?: NewVipRight | null;
  extInfo?: {
    logo?: NewVipLogo | null;
  } | null;
  musicPackage?: NewVipRight | null;
  redplus?: NewVipRight | null;
  redVipAnnualCount?: number | null;
  redVipLevel?: number | null;
  relationType?: number | null;
};

type NewCommentUser = Omit<
  CommentUser,
  'encryptUserId' | 'isHug' | 'vipRights'
> & {
  encryptUserId?: string | null;
  isHug?: boolean | null;
  vipRights?: NewVipRights | null;
};

type NewComment = Omit<
  CommentRecord,
  | 'args'
  | 'commentVideoVO'
  | 'extInfo'
  | 'highlight'
  | 'privacy'
  | 'repliedMark'
  | 'replyCount'
  | 'showFloorComment'
  | 'threadId'
  | 'track'
  | 'user'
  | 'userTop'
  | 'voiceDurationMillSecond'
> & {
  args?: string | null;
  commentVideoVO?: {
    allowCreation?: boolean | null;
    forbidCreationText?: string | null;
    showCreationEntrance?: boolean | null;
    videoCount?: number | null;
  } | null;
  extInfo?: {
    authorRepliedIds?: Array<number> | null;
    forwardEvent?: number | null;
    repliedByAuthorCount?: string | null;
    statistics?: {
      ext_dislike?: number | null;
      status_60?: number | null;
      status_80?: number | null;
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
  track?: string | null;
  user?: NewCommentUser | null;
  userTop?: boolean | null;
  voiceDurationMillSecond?: number | null;
};

type NewLikeAnimation = {
  version?: number | null;
};

type NewSortType = {
  sortType?: number | null;
  sortTypeName?: string | null;
  target?: string | null;
};

type CommentNewBody = {
  code: 200;
  message?: string | null;
  data: {
    comments: Array<NewComment>;
    commentsTitle?: string | null;
    currentCommentTitle?: string | null;
    cursor?: string | null;
    expandCount?: number | null;
    hasMore?: boolean | null;
    likeAnimation?: NewLikeAnimation | null;
    newReplyExpGroupName?: string | null;
    sortType?: number | null;
    sortTypeList?: Array<NewSortType> | null;
    style?: string | null;
    totalCount?: number | null;
  };
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)、[CommentUser](/api/shared-types#commentuser)

| 字段                               | 类型                 | 必填 | 说明                         |
| ---------------------------------- | -------------------- | ---- | ---------------------------- |
| `code`                             | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `message`                          | `string`             | 否   | 返回说明信息                 |
| `data`                             | `object`             | 是   | 接口返回的数据主体           |
| `data.comments`                    | `Array<NewComment>`  | 是   | 评论列表                     |
| `data.commentsTitle`               | `string`             | 否   | -                            |
| `data.currentCommentTitle`         | `string`             | 否   | -                            |
| `data.cursor`                      | `string`             | 否   | 下一页分页游标               |
| `data.expandCount`                 | `number`             | 否   | -                            |
| `data.hasMore`                     | `boolean`            | 否   | 是否还有更多数据             |
| `data.likeAnimation`               | `NewLikeAnimation`   | 否   | -                            |
| `data.likeAnimation.version`       | `number`             | 否   | 当前服务版本号               |
| `data.newReplyExpGroupName`        | `string`             | 否   | -                            |
| `data.sortType`                    | `number`             | 否   | -                            |
| `data.sortTypeList`                | `Array<NewSortType>` | 否   | -                            |
| `data.sortTypeList[].sortType`     | `number`             | 否   | -                            |
| `data.sortTypeList[].sortTypeName` | `string`             | 否   | -                            |
| `data.sortTypeList[].target`       | `string`             | 否   | -                            |
| `data.style`                       | `string`             | 否   | -                            |
| `data.totalCount`                  | `number`             | 否   | 评论或条目总数               |

<!-- api-doc:response:end -->
