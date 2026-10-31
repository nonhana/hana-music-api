---
title: '获取话题详情热门动态'
description: '调用此接口，可获取话题详情热门动态'
---

# 获取话题详情热门动态

> 调用此接口，可获取话题详情热门动态

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/topic/detail/event/hot` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 否                        |
| 对应模块 | `topic_detail_event_hot`  |
| 文档分类 | 社交与消息                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /topic/detail/event/hot?actid=111551188
```

## 编程式调用

```ts
import { topicDetailEventHot } from 'hana-music-api';

const result = await topicDetailEventHot({
  actid: '111551188',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.events` 和每条动态自己的编号 `body.events[].id` 收紧；动态记录与 `event` 使用同一套声明，`topEvent` 是宽松布尔字段。`contentDeclaration`、`repostSource`、`resourceUniqueId` 按共享记录声明为宽松字符串（类型证据来自 `event` 录制）。已知例外：非 null 扩展对象 `anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`pointTopicInfo`、`privacySettingInfo`、`tailMark`、`xInfo` 未声明；`likeAnimationMap` 只见过空对象、`topActivityInfos` 只见过空数组；`adInfo`、`pubSource` 在本录制里只有 `null`。这些字段都原样保留（JSON）。未知话题返回 `code: 404`（录制 `topic_detail_event_hot.unknown.json`），按业务拒绝原样转交。非空录制保留 2 条（原 5 条，索引 0/4）；话题 47972517 没有热门动态，返回 `events: []`（录制 `topic_detail_event_hot.empty.json`）。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `topic_detail_event_hot.missing-actid.json`，未知话题的 `code:404` 录制见 `topic_detail_event_hot.unknown.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。`SPECIAL_STATUS_CODES` 里的其他码（201/302/502 以原码拒绝，800–803 钳位为 400）同样以 `status=业务码` 拒绝；不在该表里的码（如 404）原样转交。

## 补充说明

说明 : 调用此接口，可获取话题详情热门动态

**接口地址 :** `/topic/detail/event/hot`

**调用例子 :** `/topic/detail/event/hot?actid=111551188`
