---
title: '发送/删除评论'
description: '调用此接口，可发送评论或者删除评论'
---

# 发送/删除评论

调用此接口，可发送评论或者删除评论

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                        |
| ---------- | ----------------------------------------- |
| 接口地址   | `/comment`                                |
| 请求方式   | `GET` / `POST`                            |
| 需要登录   | 是                                        |
| 对应模块   | `comment`                                 |
| SDK 函数   | `comment`（`hana-music-api/api/comment`） |
| 返回体类型 | `UnknownJson`（未建模接口）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { comment } from 'hana-music-api';

const result = await comment(
  {
    t: 1,
    type: 1,
    id: '5436712',
    content: 'test',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/comment' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 't=1' \
  --data-urlencode 'type=1' \
  --data-urlencode 'id=5436712' \
  --data-urlencode 'content=test'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型               | 必填 | 默认值 | 说明                                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commentId` | `number \| string` | 否   | -      | 回复的评论 id (回复评论时必填)<br>**调用例子** : `/comment?t=1&type=1&id=5436712&content=test` (往广岛之恋 mv 发送评论: test)<br>注意：如给动态发送评论，则不需要传 id，需要传动态的 `threadId`，如：`/comment?t=1&type=6&threadId=A_EV_2_6559519868_32953014&content=test`<br>2. 删除评论<br>**必选参数** |
| `content`   | `string`           | 否   | -      | 要发送的内容                                                                                                                                                                                                                                                                                               |
| `id`        | `number \| string` | 是   | -      | 对应资源 id                                                                                                                                                                                                                                                                                                |
| `t`         | `0 \| 1 \| 2`      | 是   | -      | 1 发送，2 回复                                                                                                                                                                                                                                                                                             |
| `threadId`  | `string`           | 否   | -      | 资源线程 ID（评论动态 `type=6` 时必填，用于代替 `id`）                                                                                                                                                                                                                                                     |
| `type`      | `number`           | 是   | -      | 数字，资源类型，对应歌曲，mv，专辑，歌单，电台，视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台<br>5: 视频<br>6: 动态                                                                                                                                                                |

| `t` | 操作                         |
| --- | ---------------------------- |
| `1` | 发送评论                     |
| `2` | 回复评论（需传 `commentId`） |
| `0` | 删除评论（需传 `commentId`） |

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

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **动态评论**：当 `type=6`（动态）时，实际使用 `threadId` 字段标识动态，无需依赖数字资源 ID。
