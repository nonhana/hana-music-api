---
title: '给评论点赞'
description: '调用此接口，传入 type，资源 id，和评论 id cid 和 是否点赞参数 t 即可给对'
---

# 给评论点赞

调用此接口，传入 type，资源 id，和评论 id cid 和 是否点赞参数 t 即可给对

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/comment/like`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `comment_like`                                     |
| SDK 函数   | `commentLike`（`hana-music-api/api/comment_like`） |
| 返回体类型 | `CommentLikeBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentLike } from 'hana-music-api';

const result = await commentLike(
  {
    id: '29178366',
    cid: '12840183',
    t: 1,
    type: 0,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/like' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=29178366' \
  --data-urlencode 'cid=12840183' \
  --data-urlencode 't=1' \
  --data-urlencode 'type=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                                                                                                                                                       |
| ---------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cid`      | `number \| string` | 是   | -      | 评论 id                                                                                                                                                    |
| `id`       | `number \| string` | 是   | -      | 资源 id，如歌曲 id，mv id                                                                                                                                  |
| `t`        | `0 \| 1`           | 是   | -      | 是否点赞，1 为点赞 ，0 为取消点赞                                                                                                                          |
| `threadId` | `string`           | 否   | -      | 资源线程 ID（点赞动态评论 `type=6` 时使用）                                                                                                                |
| `type`     | `number`           | 是   | -      | 数字，资源类型，对应歌曲，mv，专辑，歌单，电台，视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |

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

返回体类型：`CommentLikeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_like`、`hana-music-api/schemas/comment_like` 导入运行时校验器）。

```ts
type CommentLikeBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->

## 注意事项

- **动态评论点赞**：当 `type=6`（动态）时，需传入动态的 `threadId`。
