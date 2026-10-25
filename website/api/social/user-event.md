---
title: '获取用户动态'
description: '登录后调用此接口，传入用户 id, 可以获取用户动态'
---

# 获取用户动态

> 登录后调用此接口，传入用户 id, 可以获取用户动态

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/event`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_event`   |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数       | 类型             | 必填 | 默认值                  | 说明                                                                             |
| ---------- | ---------------- | :--: | ----------------------- | -------------------------------------------------------------------------------- |
| `uid`      | string           |  ✅  | -                       | 用户 id                                                                          |
| `limit`    | number \| string |  —   | 30                      | 返回数量，默认为 30                                                              |
| `lasttime` | string           |  —   | -1,传入上一次返回结果的 | 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /user/event?uid=32953014
GET /user/event?uid=32953014&limit=1&lasttime=1558011138743
```

## 编程式调用

```ts
import { userEvent } from 'hana-music-api';

const result = await userEvent({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.events` 和每条动态的 `body.events[].id` 收紧；没有动态时 `events` 是空数组（录制 `user_event.empty.json`）。`json` 是动态正文的 JSON 字符串，`info` 是评论信息；作者 `events[].user`、图片 `pics`、`ipLocation` 和计数/展示字段都是宽松字段。`info.commentThread` 和 `events[].user` 是附带对象，编号不收紧；`commentThread.latestLikedUsers[]` 的 `s`、`t` 声明为宽松数字字段。`lasttime`、`more`、`size` 宽松。已知例外：`adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`likeAnimationMap`、`pointTopicInfo`、`privacySettingInfo`、`pubSource`、`topActivityInfos`、`topEvent`、`xInfo` 等扩展块未声明，字段原样保留（JSON）；`ipLocation.ip`、`commentThread.resourceInfo.imgUrl`、`vipRights.memberLogo` 等只见过 `null` 的子字段也未声明。结构定义和类型是 `UserEventBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，传入用户 id, 可以获取用户动态

**必选参数 :** `uid` : 用户 id

**可选参数 :** `limit` : 返回数量，默认为 30

`lasttime` : 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据

**接口地址 :** `/user/event`

**调用例子 :** `/user/event?uid=32953014` `/user/event?uid=32953014&limit=1&lasttime=1558011138743`

返回结果的`type`参数对应:

```text
18 分享单曲
19 分享专辑
17、28 分享电台节目
22 转发
39 发布视频
35、13 分享歌单
24 分享专栏文章
41、21 分享视频
```
