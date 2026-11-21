---
title: '热门评论'
description: '调用此接口，传入 type，资源 id 可获得对应资源热门评论 ( 不需要登录 )'
---

# 热门评论

调用此接口，传入 type，资源 id 可获得对应资源热门评论 ( 不需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/comment/hot`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `comment_hot`                                    |
| SDK 函数   | `commentHot`（`hana-music-api/api/comment_hot`） |
| 返回体类型 | `CommentHotBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentHot } from 'hana-music-api';

const result = await commentHot({
  id: '186016',
  type: 0,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/hot' \
  --data-urlencode 'id=186016' \
  --data-urlencode 'type=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                                                                                                       |
| -------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `before` | `number`           | 否   | `0`    | 分页参数，取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到)                                                                     |
| `id`     | `number \| string` | 是   | -      | 资源 id                                                                                                                                                    |
| `limit`  | `number`           | 否   | `20`   | 取出评论数量，默认为 20                                                                                                                                    |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*20，其中 20 为 limit 的值                                                                                          |
| `type`   | `number`           | 是   | -      | 数字，资源类型，对应歌曲，mv，专辑，歌单，电台，视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |

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

返回体类型：`CommentHotBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_hot`、`hana-music-api/schemas/comment_hot` 导入运行时校验器）。

```ts
type CommentHotBody = {
  code: 200;
  hotComments: Array<CommentRecord>;
  hasMore?: boolean | null;
  total?: number | null;
};
```

- **公共类型**：[CommentRecord](/api/shared-types#commentrecord)

| 字段          | 类型                                                      | 必填 | 说明                         |
| ------------- | --------------------------------------------------------- | ---- | ---------------------------- |
| `code`        | `200`                                                     | 是   | 业务状态码（`200` 表示成功） |
| `hotComments` | Array\<[CommentRecord](/api/shared-types#commentrecord)\> | 是   | 热门评论列表                 |
| `hasMore`     | `boolean`                                                 | 否   | 是否还有更多数据             |
| `total`       | `number`                                                  | 否   | 总条目数                     |

<!-- api-doc:response:end -->
