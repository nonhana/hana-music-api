---
title: "给评论点赞"
description: "调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对"
---

# 给评论点赞

> 调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/comment/like` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `comment_like` |
| 文档分类 | 评论 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 资源 id, 如歌曲 id,mv id |
| `cid` | string | ✅ | - | 评论 id |
| `t` | string | ✅ | - | 是否点赞 , 1 为点赞 ,0 为取消点赞 |
| `type` | string | ✅ | - | 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |

## HTTP 示例

```bash
GET /comment/like?id=29178366&cid=12840183&t=1&type=0
GET /comment/like?type=6&cid=1419532712&threadId=A_EV_2_6559519868_32953014&t=0
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.comment_like({
  id: "29178366",
  cid: "12840183",
  t: "1",
  type: "0",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对
应评论点赞 ( 需要登录 )

**必选参数 :** `id` : 资源 id, 如歌曲 id,mv id

`cid` : 评论 id

`t` : 是否点赞 , 1 为点赞 ,0 为取消点赞

`type`: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型

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

**接口地址 :** `/comment/like`

**调用例子 :** `/comment/like?id=29178366&cid=12840183&t=1&type=0` 对应给 [https://music.163.com/#/song?id=29178366](https://music.163.com/#/song?id=29178366) 最热门的评论点赞

注意： 动态点赞不需要传入 id 参数，需要传入动态的 `threadId` 参数,如：`/comment/like?type=6&cid=1419532712&threadId=A_EV_2_6559519868_32953014&t=0`， `threadId` 可通过 `/event`，`/user/event` 接口获取

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
