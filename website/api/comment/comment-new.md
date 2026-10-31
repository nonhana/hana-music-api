---
title: '新版评论接口'
description: '调用此接口，传入资源类型和资源 id,以及排序方式,可获取对应资源的评论'
---

# 新版评论接口

> 调用此接口，传入资源类型和资源 id,以及排序方式,可获取对应资源的评论

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/comment/new` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `comment_new`  |
| 文档分类 | 评论           |

## 请求参数

| 参数       | 类型             | 必填 | 默认值 | 说明                                                                                                                                                       |
| ---------- | ---------------- | :--: | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | string           |  ✅  | -      | 资源 id, 如歌曲 id,mv id                                                                                                                                   |
| `type`     | string           |  ✅  | -      | 数字，资源类型，对应歌曲，mv, 专辑，歌单，电台, 视频对应以下类型<br>0: 歌曲<br>1: mv<br>2: 歌单<br>3: 专辑<br>4: 电台节目<br>5: 视频<br>6: 动态<br>7: 电台 |
| `pageNo`   | number \| string |  —   | 1      | 分页参数,第 N 页,默认为 1                                                                                                                                  |
| `pageSize` | number \| string |  —   | 20     | 分页参数,每页多少条数据,默认 20                                                                                                                            |
| `sortType` | string           |  —   | -      | 排序方式, 1:按推荐排序, 2:按热度排序, 3:按时间排序                                                                                                         |
| `cursor`   | number \| string |  —   | -      | 当`sortType`为 3 时且页数不是第一页时需传入,值为上一条数据的 time                                                                                          |

## HTTP 示例

```bash
GET /comment/new?type=0&id=1407551413&sortType=3
GET /comment/new?type=0&id=1407551413&sortType=3&cursor=1602072870260&pageSize=20&pageNo=2
```

## 编程式调用

```ts
import { commentNew } from 'hana-music-api';

const result = await commentNew({
  type: '0',
  id: '1407551413',
  sortType: '3',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data.comments`、`body.data.comments[].commentId` 收紧；每条 v2 评论复用 `CommentRecord` 后额外声明 `args`、`threadId`、`track`、`replyCount`、`privacy`、`repliedMark`、`highlight`、`userTop`、`voiceDurationMillSecond`、`showFloorComment`、`extInfo`、`commentVideoVO`，用户额外声明 `encryptUserId`、`isHug` 和会员角标 `vipRights.extInfo.logo`。`data` 里的 `commentsTitle`、`currentCommentTitle`、`cursor`、`expandCount`、`hasMore`、`likeAnimation`、`newReplyExpGroupName`、`sortType`、`sortTypeList`、`style`、`totalCount` 宽松；`tag`、`likeAnimationMap`、`outShowComments` 只见过空容器或 `null`，没有声明，原样保留。无评论资源（录制 `comment_new.empty.json`，云盘歌曲 1984488794；私有云盘上传，匿名不可见，`total: 0` 可能来自匿名不可访问）返回 `comments: []`、`totalCount: 0`；非空录制 `comment_new.default.json`（歌曲 2092595510）保留覆盖各字段的非连续 6 条（原 27 条，`context.truncated.length` 记原长度）。登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。

## 补充说明

说明 : 调用此接口，传入资源类型和资源 id,以及排序方式,可获取对应资源的评论

**必选参数 :**  
`id` : 资源 id, 如歌曲 id,mv id

`type`: 数字，资源类型，对应歌曲，mv, 专辑，歌单，电台, 视频对应以下类型

```text
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台节目

5: 视频

6: 动态

7: 电台
```

**可选参数 :**  
`pageNo`:分页参数,第 N 页,默认为 1

`pageSize`:分页参数,每页多少条数据,默认 20

`sortType`: 排序方式, 1:按推荐排序, 2:按热度排序, 3:按时间排序

`cursor`: 当`sortType`为 3 时且页数不是第一页时需传入,值为上一条数据的 time

**接口地址 :** `/comment/new`

**调用例子 :** `/comment/new?type=0&id=1407551413&sortType=3`, `/comment/new?type=0&id=1407551413&sortType=3&cursor=1602072870260&pageSize=20&pageNo=2`
