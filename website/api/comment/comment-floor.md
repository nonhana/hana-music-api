---
title: '楼层评论'
description: '调用此接口，传入资源 parentCommentId 和资源类型 type 和资源 id 参数，可获得该资源的歌曲楼层评论'
---

# 楼层评论

调用此接口，传入资源 parentCommentId 和资源类型 type 和资源 id 参数，可获得该资源的歌曲楼层评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/comment/floor`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `comment_floor`                                      |
| SDK 函数   | `commentFloor`（`hana-music-api/api/comment_floor`） |
| 返回体类型 | `CommentFloorBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentFloor } from 'hana-music-api';

const result = await commentFloor({
  parentCommentId: '1438569889',
  id: '29764564',
  type: 0,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/floor' \
  --data-urlencode 'parentCommentId=1438569889' \
  --data-urlencode 'id=29764564' \
  --data-urlencode 'type=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数              | 类型               | 必填 | 默认值 | 说明                                                                                                                                                       |
| ----------------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | `number \| string` | 是   | -      | 资源 id                                                                                                                                                    |
| `limit`           | `number`           | 否   | `20`   | 取出评论数量，默认为 20                                                                                                                                    |
| `parentCommentId` | `number \| string` | 是   | -      | 楼层评论 id                                                                                                                                                |
| `time`            | `number`           | 否   | `-1`   | 分页参数，取上一页最后一项的 `time` 获取下一页数据                                                                                                         |
| `type`            | `number`           | 是   | -      | 数字，资源类型，对应歌曲，mv，专辑，歌单，电台，视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |

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

返回体类型：`CommentFloorBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_floor`、`hana-music-api/schemas/comment_floor` 导入运行时校验器）。

```ts
type LooseCommentRecord = Omit<CommentRecord, 'commentId'> & {
  commentId?: number | null;
};

type CommentFloorBody = {
  code: 200;
  message?: string | null;
  data: {
    comments: Array<CommentRecord>;
    ownerComment?: LooseCommentRecord | null;
    hasMore?: boolean | null;
    totalCount?: number | null;
    time?: number | null;
  };
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)

| 字段                          | 类型                                                      | 必填 | 说明                                                    |
| ----------------------------- | --------------------------------------------------------- | ---- | ------------------------------------------------------- |
| `code`                        | `200`                                                     | 是   | 业务状态码（`200` 表示成功）                            |
| `message`                     | `string`                                                  | 否   | 返回说明信息                                            |
| `data`                        | `object`                                                  | 是   | 接口返回的数据主体                                      |
| `data.comments`               | Array\<[CommentRecord](/api/shared-types#commentrecord)\> | 是   | 评论列表                                                |
| `data.ownerComment`           | `LooseCommentRecord`                                      | 否   | 继承自 [CommentRecord](/api/shared-types#commentrecord) |
| `data.ownerComment.commentId` | `number`                                                  | 否   | 评论 ID                                                 |
| `data.hasMore`                | `boolean`                                                 | 否   | 是否还有更多数据                                        |
| `data.totalCount`             | `number`                                                  | 否   | 评论或条目总数                                          |
| `data.time`                   | `number`                                                  | 否   | 时间戳                                                  |

<!-- api-doc:response:end -->
