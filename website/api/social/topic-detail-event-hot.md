---
title: '获取话题详情热门动态'
description: '调用此接口，可获取话题详情热门动态'
---

# 获取话题详情热门动态

调用此接口，可获取话题详情热门动态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                   |
| ---------- | -------------------------------------------------------------------- |
| 接口地址   | `/topic/detail/event/hot`                                            |
| 请求方式   | `GET` / `POST`                                                       |
| 需要登录   | 否                                                                   |
| 对应模块   | `topic_detail_event_hot`                                             |
| SDK 函数   | `topicDetailEventHot`（`hana-music-api/api/topic_detail_event_hot`） |
| 返回体类型 | `TopicDetailEventHotBody`（已建模返回体）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topicDetailEventHot } from 'hana-music-api';

const result = await topicDetailEventHot({
  actid: '111551188',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/topic/detail/event/hot' \
  --data-urlencode 'actid=111551188'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明    |
| ------- | ------------------ | ---- | ------ | ------- |
| `actid` | `number \| string` | 是   | -      | 话题 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopicDetailEventHotBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/topic_detail_event_hot`、`hana-music-api/schemas/topic_detail_event_hot` 导入运行时校验器）。

```ts
type EventRecord = {
  id: number;
  actId?: number | null;
  actName?: string | null;
  aiPrivatePic?: boolean | null;
  canShare?: boolean | null;
  containAiContent?: boolean | null;
  contentDeclaration?: string | null;
  discussId?: string | null;
  encryptUserId?: string | null;
  eventTime?: number | null;
  expireTime?: number | null;
  extType?: string | null;
  firstEditTime?: number | null;
  forwardCount?: number | null;
  info?: EventInfo | null;
  insiteForwardCount?: number | null;
  ipLocation?: EventIpLocation | null;
  json?: string | null;
  more?: boolean | null;
  musicianSay?: boolean | null;
  needAiDefaultPic?: boolean | null;
  owner?: boolean | null;
  pics?: Array<EventPic> | null;
  privacySetting?: number | null;
  relationTopic?: boolean | null;
  repostSource?: string | null;
  resourceUniqueId?: string | null;
  showFollowButton?: boolean | null;
  showTime?: number | null;
  songPlayStyle?: string | null;
  threadId?: string | null;
  tmplId?: number | null;
  topEvent?: boolean | null;
  type?: number | null;
  typeDesc?: string | null;
  user?: EventUser | null;
  uuid?: string | null;
};

type TopicDetailEventHotBody = {
  code: 200;
  events: Array<EventRecord>;
};
```

- **公共类型**：[EventInfo](/api/shared-types#eventinfo)、[EventIpLocation](/api/shared-types#eventiplocation)、[EventPic](/api/shared-types#eventpic)、[EventUser](/api/shared-types#eventuser)

| 字段     | 类型                 | 必填 | 说明                         |
| -------- | -------------------- | ---- | ---------------------------- |
| `code`   | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `events` | `Array<EventRecord>` | 是   | 动态列表                     |

<!-- api-doc:response:end -->
