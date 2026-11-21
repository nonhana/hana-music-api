---
title: '电台节目评论'
description: '调用此接口，传入音乐 id 和 limit 参数，可获得该 电台节目 的所有评论 ('
---

# 电台节目评论

调用此接口，传入音乐 id 和 limit 参数，可获得该 电台节目 的所有评论 (

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/comment/dj`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `comment_dj`                                   |
| SDK 函数   | `commentDj`（`hana-music-api/api/comment_dj`） |
| 返回体类型 | `CommentDjBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { commentDj } from 'hana-music-api';

const result = await commentDj({
  id: '794062371',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment/dj' \
  --data-urlencode 'id=794062371'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                                   |
| -------- | ------------------ | ---- | ------ | -------------------------------------------------------------------------------------- |
| `before` | `number`           | 否   | `0`    | 分页参数，取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到) |
| `id`     | `number \| string` | 是   | -      | 电台节目的 id                                                                          |
| `limit`  | `number`           | 否   | `20`   | 取出评论数量，默认为 20                                                                |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*20，其中 20 为 limit 的值                      |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CommentDjBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/comment_dj`、`hana-music-api/schemas/comment_dj` 导入运行时校验器）。

```ts
type CommentDjBody = {
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
