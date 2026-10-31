---
title: '获取动态列表'
description: '调用此接口，可获取各种动态，对应网页版网易云，朋友界面里的各种动态消息'
---

# 获取动态列表

> 调用此接口，可获取各种动态，对应网页版网易云，朋友界面里的各种动态消息

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/event`       |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `event`        |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数       | 类型             | 必填 | 默认值                  | 说明                                                                             |
| ---------- | ---------------- | :--: | ----------------------- | -------------------------------------------------------------------------------- |
| `pagesize` | number \| string |  ✅  | 20                      | 每页数据,默认 20                                                                 |
| `lasttime` | string           |  ✅  | -1,传入上一次返回结果的 | 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /event?pagesize=30&lasttime=1556740526369
```

## 编程式调用

```ts
import { event } from 'hana-music-api';

const result = await event({
  pagesize: '30',
  lasttime: '1556740526369',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.event` 和每条动态的 `body.event[].id` 收紧；没有动态时 `event` 是空数组（录制 `event.empty.json`，登录账号用 `lasttime=1` 取空，此时没有 `lasttime`）。`json` 是动态正文的 JSON 字符串，`info` 是评论信息；作者 `event[].user`、图片 `pics`、`ipLocation`、`topEvent` 和计数/展示字段都是宽松字段；`privacySetting`、`uuid` 也是宽松字段。`contentDeclaration`、`repostSource` 按事件列表里的空串证据声明为宽松字符串，`resourceUniqueId` 的宽松字符串类型证据来自 `user_event` 录制。`info.commentThread` 和 `event[].user` 是附带对象，编号不收紧；`commentThread.latestLikedUsers[]` 的 `s`、`t` 是宽松数字字段。`lasttime`、`more` 宽松。已知例外：非 null 扩展对象 `adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`pointTopicInfo`、`privacySettingInfo`、`pubSource`、`xInfo` 未声明；`likeAnimationMap` 只见过空对象、`topActivityInfos` 只见过空数组；`tailMark` 在本录制里只有 `null`。这些字段都原样保留（JSON）。非空录制原 20 条保留 3 条（索引 0/4/9，id 37982331004、37819249612、37812157222）。登录对照先用 `login_status` 确认 `account.anonimousUser: false`；本批匿名调用返回的空列表与登录后的空结果逐字段一致。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `event.invalid-pagesize.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。`SPECIAL_STATUS_CODES` 里的其他码（201/302/502 以原码拒绝，800–803 钳位为 400）同样以 `status=业务码` 拒绝；不在该表里的码（如 404）原样转交。

## 补充说明

说明 : 调用此接口，可获取各种动态，对应网页版网易云，朋友界面里的各种动态消息
，如分享的视频，音乐，照片等！

**必选参数 :**
`pagesize` : 每页数据,默认 20

`lasttime` : 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据

**接口地址 :** `/event`

**调用例子 :** `/event?pagesize=30&lasttime=1556740526369`
