---
title: "发送/删除评论"
description: "调用此接口,可发送评论或者删除评论"
---

# 发送/删除评论

> 调用此接口,可发送评论或者删除评论

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/comment` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `comment` |
| 文档分类 | 评论 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `t` | string | ✅ | - | 1 发送, 2 回复 |
| `type` | string | ✅ | - | 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台<br>5: 视频<br>6: 动态 |
| `id` | string | ✅ | - | 对应资源 id |
| `content` | string | ✅ | - | 要发送的内容 |
| `commentId` | string | ✅ | - | 回复的评论 id (回复评论时必填)<br>**调用例子** : `/comment?t=1&type=1&id=5436712&content=test` (往广岛之恋 mv 发送评论: test)<br>注意：如给动态发送评论，则不需要传 id，需要传动态的 `threadId`,如：`/comment?t=1&type=6&threadId=A_EV_2_6559519868_32953014&content=test`<br>2. 删除评论<br>**必选参数** |

## HTTP 示例

```bash
GET /comment?t=1&type=1&id=5436712&content=test
GET /comment?t=1&type=6&threadId=A_EV_2_6559519868_32953014&content=test
GET /comment/mv
GET /comment?t=0&type=1&id=5436712&commentId=1535550516319
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.comment({
  t: "1",
  type: "1",
  id: "5436712",
  content: "test",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可发送评论或者删除评论

**接口地址 :** `/comment`

1. 发送评论

   **必选参数**

   `t`:1 发送, 2 回复

   `type`: 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型

   ```
   0: 歌曲

   1: mv

   2: 歌单

   3: 专辑

   4: 电台

   5: 视频

   6: 动态
   ```

   `id`:对应资源 id

   `content` :要发送的内容

   `commentId` :回复的评论 id (回复评论时必填)

   **调用例子** : `/comment?t=1&type=1&id=5436712&content=test` (往广岛之恋 mv 发送评论: test)

   注意：如给动态发送评论，则不需要传 id，需要传动态的 `threadId`,如：`/comment?t=1&type=6&threadId=A_EV_2_6559519868_32953014&content=test`

2. 删除评论

   **必选参数**

   `t`:0 删除

   `type`: 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型  
   

    ```
    0: 歌曲

    1: mv

    2: 歌单

    3: 专辑

    4: 电台节目

    5: 视频

    6: 动态

    7: 电台

    ```  
   
   `id`:对应资源 id
   `content` :内容 id,可通过 `/comment/mv` 等接口获取

   **调用例子** : `/comment?t=0&type=1&id=5436712&commentId=1535550516319` (在广岛之恋 mv 删除评论)

   注意：如给动态删除评论，则不需要传 id，需要传动态的 `threadId`,如：`/comment?t=0&type=6&threadId=A_EV_2_6559519868_32953014&commentId=1419516382`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
